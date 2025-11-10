import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import admin from '@/lib/firebase-admin';
import { RPC_ENDPOINT, usersKeysAddress } from '@/lib/dappParams';
import {
  authenticateRequest,
  authenticationError,
  errorResponse,
  internalError,
  successResponse,
  isValidEthereumAddress,
  validateRequiredFields,
} from '@/lib/api';
import type { TradeConfirmRequest } from '@/lib/api';
import contractAbi from '../../../../../usersKeysAbi';

const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT);

export async function POST(request: Request) {
  // Authenticate user
  const user = await authenticateRequest();
  if (!user) {
    return authenticationError();
  }

  try {
    const body: TradeConfirmRequest = await request.json();
    const { ethereumAddress, subjectUID, amount, userUID, txHash, tradeType } = body;

    // Validate required fields
    if (!validateRequiredFields(body, ['ethereumAddress', 'subjectUID', 'amount', 'userUID', 'txHash', 'tradeType'])) {
      return errorResponse('Missing required fields', 103, 400);
    }

    const db = admin.firestore();

    // Sets up references to Firestore collections
    const userRef = db.collection('users').doc(userUID);
    const subjectRef = db.collection('users').doc(subjectUID);
    const tradesRef = db.collection('trades');
    const chatID = [userUID, subjectUID].sort().join('-');
    const chatRef = db.collection('chats').doc(chatID);

    if (tradeType === 'buy') {
      await handleBuyTrade(userRef, subjectRef, chatRef, tradesRef, subjectUID, amount, txHash, userUID);
    } else if (tradeType === 'sell') {
      const subjectDoc = await subjectRef.get();
      const subjectKey = subjectDoc.data()?.ethereumAddress;

      // Validate Ethereum addresses
      if (!isValidEthereumAddress(ethereumAddress) || !isValidEthereumAddress(subjectKey)) {
        return errorResponse('Invalid Ethereum address', 103, 400);
      }

      await handleSellTrade(userRef, subjectRef, subjectKey, ethereumAddress, subjectUID, amount);
    } else {
      return errorResponse('Invalid trade type', 103, 400);
    }

    return successResponse('Trade processed', { txHash });
  } catch (error) {
    return internalError(error);
  }
}

async function handleBuyTrade(
  userRef: FirebaseFirestore.DocumentReference,
  subjectRef: FirebaseFirestore.DocumentReference,
  chatRef: FirebaseFirestore.DocumentReference,
  tradesRef: FirebaseFirestore.CollectionReference,
  subjectUID: string,
  amount: number,
  txHash: string,
  userUID: string
): Promise<void> {
  const userKeysRef = userRef.collection('keys').doc(subjectUID);
  const userKeysDoc = await userKeysRef.get();

  const numberAmount = Number(amount);

  if (userKeysDoc.exists) {
    await userKeysRef.update({
      amount: admin.firestore.FieldValue.increment(numberAmount),
    });
  } else {
    await userKeysRef.set({ amount: numberAmount });
  }

  await subjectRef.update({
    holders: admin.firestore.FieldValue.increment(numberAmount),
  });

  const chatDoc = await chatRef.get();
  if (!chatDoc.exists) {
    await chatRef.set({
      participants: [userUID, subjectUID],
      messages: [],
      lastUpdate: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await tradesRef.add({
    type: 'buy',
    user: userUID,
    subject: subjectUID,
    trader: userUID,
    amount,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    txHash,
  });
}

async function handleSellTrade(
  userRef: FirebaseFirestore.DocumentReference,
  subjectRef: FirebaseFirestore.DocumentReference,
  subjectKey: string,
  ethereumAddress: string,
  subjectUID: string,
  amount: number
): Promise<void> {
  const usersKeysCContract = new ethers.Contract(usersKeysAddress, contractAbi, provider);
  const userKeyCount = await usersKeysCContract.keysBalance(subjectKey, ethereumAddress);

  const userKeysRef = userRef.collection('keys').doc(subjectUID);
  const userKeysDoc = await userKeysRef.get();

  if (userKeysDoc.exists && Number(userKeyCount) === amount) {
    // User sold all keys - delete the document
    await userKeysRef.delete();
    await subjectRef.update({
      holders: admin.firestore.FieldValue.increment(-1),
    });
  } else if (userKeysDoc.exists) {
    // Decrement the amount
    const numberAmount = Number(amount);
    await userKeysRef.update({
      amount: admin.firestore.FieldValue.increment(-numberAmount),
    });
  } else {
    // Document doesn't exist - set initial amount
    await userKeysRef.set({
      amount: Number(userKeyCount) - amount,
    });
  }
}
