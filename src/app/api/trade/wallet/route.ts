export const maxDuration = 60;

import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import admin from '@/lib/firebase-admin';
import * as dappParams from '@/lib/dappParams';
import {
  authenticateRequest,
  authenticationError,
  errorResponse,
  internalError,
  validateRequiredFields,
} from '@/lib/api';
import type { TradeRequest } from '@/lib/api';
import contractAbi from './../../../../usersKeysAbi';
import usdtTokenAbi from '../../../../usdtTokenAbi';

const provider = new ethers.JsonRpcProvider(dappParams.RPC_ENDPOINT);

export async function POST(request: Request) {
  // Authenticate user
  const user = await authenticateRequest();
  if (!user) {
    return authenticationError();
  }

  try {
    const body: TradeRequest = await request.json();
    const { type: tradeType, subjectUID, amount, userAddress: ethereumAddress } = body;

    // Validate required fields
    if (!validateRequiredFields(body, ['type', 'subjectUID', 'amount', 'userAddress'])) {
      return errorResponse('Missing required fields', 103, 400);
    }

    // Get subject data
    const subjectRef = admin.firestore().collection('users').doc(subjectUID);
    const subjectDoc = await subjectRef.get();

    if (!subjectDoc.exists) {
      return errorResponse('Subject not found', 102, 404);
    }

    const subjectKey = subjectDoc.data()?.ethereumAddress;

    if (tradeType === 'buy') {
      return await handleBuyValidation(ethereumAddress!, subjectKey, amount);
    } else if (tradeType === 'sell') {
      return await handleSellValidation(ethereumAddress!, subjectKey, amount);
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

async function handleBuyValidation(
  ethereumAddress: string,
  subjectKey: string,
  amount: number
): Promise<NextResponse> {
  const usdtContract = new ethers.Contract(
    dappParams.usdtAddress,
    usdtTokenAbi,
    provider
  );
  const userUsdtBalance = await usdtContract.balanceOf(ethereumAddress);

  const usersKeysCContract = new ethers.Contract(
    dappParams.usersKeysAddress,
    contractAbi,
    provider
  );
  const usdtPriceForKeys = await usersKeysCContract.getBuyPrice(subjectKey, amount);

  if (userUsdtBalance < usdtPriceForKeys) {
    return errorResponse('Insufficient USDT balance', 103, 400);
  }

  return NextResponse.json({
    message: 'Ready for frontend to handle buy operation',
    usdtPriceForKeys: ethers.formatEther(usdtPriceForKeys),
    subjectKey,
    ok: true,
  });
}

async function handleSellValidation(
  ethereumAddress: string,
  subjectKey: string,
  amount: number
): Promise<NextResponse> {
  const usersKeysCContract = new ethers.Contract(
    dappParams.usersKeysAddress,
    contractAbi,
    provider
  );

  const userKeyCount = await usersKeysCContract.keysBalance(subjectKey, ethereumAddress);

  if (Number(userKeyCount) < amount) {
    return errorResponse('Insufficient keys to sell', 103, 400);
  }

  return NextResponse.json({
    message: 'Ready for frontend to handle sell operation',
    userKeyCount: Number(userKeyCount),
    keysToSell: amount,
    subjectKey,
    ok: true,
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
