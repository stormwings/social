export const maxDuration = 60;

import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import admin from '@/lib/firebase-admin';
import { RPC_ENDPOINT, usdtAddress, usersKeysAddress } from '@/lib/dappParams';
import {
  authenticateRequest,
  authenticationError,
  decryptPrivateKey,
  errorResponse,
  getUserWallet,
  internalError,
  validateEnvVar,
  validateRequiredFields,
} from '@/lib/api';
import {
  ensureSufficientGas,
  updateUserKeys,
  ensureChatExists,
  recordTrade,
} from '@/lib/api/trade-helpers';
import type { TradeRequest } from '@/lib/api';
import contractAbi from '../../../usersKeysAbi';
import usdtTokenAbi from '../../../usdtTokenAbi';

const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT);

export async function POST(request: Request) {
  // Authenticate user
  const user = await authenticateRequest();
  if (!user) {
    return authenticationError();
  }

  try {
    const body: TradeRequest = await request.json();
    const { type: tradeType, subjectUID, amount } = body;

    // Validate required fields
    if (!validateRequiredFields(body, ['type', 'subjectUID', 'amount'])) {
      return errorResponse('Missing required fields', 103, 400);
    }

    // Validate encryption key exists
    const encryptionKey = validateEnvVar('ENCRYPTION_KEY');

    const db = admin.firestore();

    // Get user's wallet
    const walletData = await getUserWallet(user.uid);
    if (!walletData) {
      return errorResponse('User not found', 102, 404);
    }

    const ethereumAddress = walletData.ethereumAddress;

    // Decrypt the private key
    const ethereumPrivateKey = decryptPrivateKey(
      walletData.encryptedPrivateKey,
      encryptionKey
    );

    console.log('wallet decrypted');

    // Get subject data
    const subjectRef = db.collection('users').doc(subjectUID);
    const subjectDoc = await subjectRef.get();

    if (!subjectDoc.exists) {
      return errorResponse('Subject not found', 102, 404);
    }

    const subjectKey = subjectDoc.data()?.ethereumAddress;
    console.log('subjectKey', subjectKey);

    // Ensure user has sufficient gas
    await ensureSufficientGas(ethereumAddress);

    if (tradeType === 'buy') {
      return await handleBuyTrade(
        db,
        user.uid,
        subjectUID,
        amount,
        ethereumAddress,
        ethereumPrivateKey,
        subjectKey,
        subjectRef
      );
    } else if (tradeType === 'sell') {
      return await handleSellTrade(
        db,
        user.uid,
        subjectUID,
        amount,
        ethereumAddress,
        ethereumPrivateKey,
        subjectKey,
        subjectRef
      );
    } else {
      return errorResponse('Invalid trade type', 103, 400);
    }
  } catch (error) {
    if (isTokenExpiredError(error)) {
      return errorResponse('Token expired', 401, 401);
    }
    return internalError(error);
  }
}

async function handleBuyTrade(
  db: FirebaseFirestore.Firestore,
  uid: string,
  subjectUID: string,
  amount: number,
  ethereumAddress: string,
  ethereumPrivateKey: string,
  subjectKey: string,
  subjectRef: FirebaseFirestore.DocumentReference
): Promise<NextResponse> {
  // Check USDT balance
  const usdtContract = new ethers.Contract(usdtAddress, usdtTokenAbi, provider);
  const userUsdtBalance = await usdtContract.balanceOf(ethereumAddress);

  const usersKeysCContract = new ethers.Contract(
    usersKeysAddress,
    contractAbi,
    provider
  );
  const usdtPriceForKeys = await usersKeysCContract.getBuyPrice(subjectKey, amount);

  console.log('usdtPriceForKeys', ethers.formatEther(usdtPriceForKeys));

  if (userUsdtBalance < usdtPriceForKeys) {
    console.log(
      'User USDT balance too low ' +
        ethereumAddress +
        ' ' +
        ethers.formatEther(userUsdtBalance) +
        ' < ' +
        ethers.formatEther(usdtPriceForKeys)
    );
    return errorResponse('Insufficient USDT balance', 103, 400);
  }

  // Check and approve USDT allowance
  const currentAllowance = await usdtContract.allowance(ethereumAddress, usersKeysAddress);
  if (currentAllowance < usdtPriceForKeys) {
    console.log('Approving USDT spend for UsersKeys contract');
    const connectedUsdtContract = usdtContract.connect(
      new ethers.Wallet(ethereumPrivateKey, provider)
    );
    const approveTx = await (connectedUsdtContract as any).approve(
      usersKeysAddress,
      usdtPriceForKeys * BigInt(10)
    );
    await approveTx.wait();
  }

  // Buy keys
  console.log('Buying keys', subjectKey, amount);
  const tx = await (usersKeysCContract as any)
    .connect(new ethers.Wallet(ethereumPrivateKey, provider))
    .buyKeys(subjectKey, amount);
  await tx.wait();

  // Update Firestore
  const userRef = db.collection('users').doc(uid);

  try {
    await updateUserKeys(userRef, subjectUID, amount, true);
    await subjectRef.update({
      holders: admin.firestore.FieldValue.increment(Number(amount)),
    });
  } catch (dbError) {
    console.error('Error updating the keys in Firestore:', dbError);
    return internalError(dbError);
  }

  console.log('Trade processed', tx.hash);

  // Create chat document if it doesn't exist
  await ensureChatExists(db, uid, subjectUID);

  // Record the trade
  await recordTrade(db, 'buy', uid, subjectUID, amount, tx.hash);

  return NextResponse.json({
    message: 'Trade processed',
    txHash: tx.hash,
  });
}

async function handleSellTrade(
  db: FirebaseFirestore.Firestore,
  uid: string,
  subjectUID: string,
  amount: number,
  ethereumAddress: string,
  ethereumPrivateKey: string,
  subjectKey: string,
  subjectRef: FirebaseFirestore.DocumentReference
): Promise<NextResponse> {
  const usersKeysCContract = new ethers.Contract(
    usersKeysAddress,
    contractAbi,
    provider
  );

  const userKeyCount = await usersKeysCContract.keysBalance(subjectKey, ethereumAddress);

  if (userKeyCount < amount) {
    return errorResponse('Insufficient keys to sell', 103, 400);
  }

  // Sell keys
  console.log('Selling keys', subjectKey, amount);
  const tx = await (usersKeysCContract as any)
    .connect(new ethers.Wallet(ethereumPrivateKey, provider))
    .sellKeys(subjectKey, amount);
  await tx.wait();

  // Update Firestore
  const userRef = db.collection('users').doc(uid);

  try {
    const userKeysRef = userRef.collection('keys').doc(subjectUID);
    const userKeysDoc = await userKeysRef.get();

    if (userKeysDoc.exists && userKeyCount === amount) {
      // User sold all keys - delete the document
      await userKeysRef.delete();
    } else if (userKeysDoc.exists) {
      // Decrement the amount
      await updateUserKeys(userRef, subjectUID, amount, false);
    } else {
      // Document doesn't exist - set initial amount
      await userKeysRef.set({
        amount: userKeyCount - amount,
      });
    }

    // Decrement holders
    await subjectRef.update({
      holders: admin.firestore.FieldValue.increment(-Number(amount)),
    });
  } catch (dbError) {
    console.error('Error updating the keys in Firestore:', dbError);
    return internalError(dbError);
  }

  console.log('Sell processed', tx.hash);

  // Record the trade
  await recordTrade(db, 'sell', uid, subjectUID, amount, tx.hash);

  return NextResponse.json({
    message: 'Sell processed',
    txHash: tx.hash,
  });
}

function isTokenExpiredError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === 'auth/id-token-expired'
  );
}
