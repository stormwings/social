import { NextResponse } from 'next/server';
import { firestore } from 'firebase-admin';
import admin from '@/lib/firebase-admin';
import {
  authenticateRequest,
  authenticationError,
  errorResponse,
  internalError,
  isPositiveNumber,
  validateRequiredFields,
} from '@/lib/api';
import type { TipRequest } from '@/lib/api';

export async function POST(request: Request) {
  // Authenticate user
  const user = await authenticateRequest();
  if (!user) {
    return authenticationError();
  }

  try {
    const body: TipRequest = await request.json();
    const { fromUser, toUser, amount, transactionHash } = body;

    // Validate required fields
    if (!validateRequiredFields(body, ['fromUser', 'toUser', 'amount', 'transactionHash'])) {
      return errorResponse('Missing required fields', 103, 400);
    }

    // Validate amount is positive
    if (!isPositiveNumber(amount)) {
      return errorResponse('Invalid request parameters.', 103, 400);
    }

    const db = admin.firestore();
    const tipRef = db.collection('tips').doc();

    await tipRef.set({
      fromUser,
      toUser,
      amount,
      timestamp: firestore.FieldValue.serverTimestamp(),
      transactionHash,
    });

    return NextResponse.json(
      { message: 'Tip registered successfully.', id: tipRef.id },
      { status: 200 }
    );
  } catch (error) {
    return internalError(error);
  }
}
