import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import admin from '@/lib/firebase-admin';
import { RPC_ENDPOINT, usdtAddress, GAS_PRICE } from '@/lib/dappParams';
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
import type { WithdrawRequest } from '@/lib/api';
import usdtTokenAbi from '../../../usdtTokenAbi';

const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT);

export async function POST(request: Request) {
  // Authenticate user
  const user = await authenticateRequest();
  if (!user) {
    return authenticationError();
  }

  try {
    const body: WithdrawRequest = await request.json();
    const { amount, address: withdrawAddress } = body;

    // Validate required fields
    if (!validateRequiredFields(body, ['amount', 'address'])) {
      return errorResponse('Missing required fields', 103, 400);
    }

    // Validate encryption key exists
    const encryptionKey = validateEnvVar('ENCRYPTION_KEY');

    // Fetch user's wallet
    const walletData = await getUserWallet(user.uid);

    if (!walletData) {
      return errorResponse('User not found', 102, 404);
    }

    if (!walletData.encryptedPrivateKey) {
      return errorResponse('Invalid wallet data', 102, 400);
    }

    // Decrypt the private key
    const userPrivateKey = decryptPrivateKey(
      walletData.encryptedPrivateKey,
      encryptionKey
    );

    // Create wallet and interact with USDT contract
    const wallet = new ethers.Wallet(userPrivateKey, provider);
    const usdtContract = new ethers.Contract(usdtAddress, usdtTokenAbi, provider);
    const connectedUsdtContract = usdtContract.connect(wallet);

    const amountInWei = ethers.parseUnits(amount.toString(), 'ether');

    const tx = await (connectedUsdtContract as any).transfer(
      withdrawAddress,
      amountInWei,
      { gasPrice: GAS_PRICE }
    );
    const receipt = await tx.wait();

    console.log(`Transaction confirmed: ${receipt.hash}`);

    return NextResponse.json({
      message: 'Withdrawal processed',
      txHash: receipt.hash,
    });
  } catch (error) {
    return internalError(error);
  }
}
