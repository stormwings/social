import { NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import {
  authenticateRequest,
  authenticationError,
  errorResponse,
  internalError,
  validateEnvVar,
  validateRequiredFields,
} from '@/lib/api';
import type { SetupWalletRequest } from '@/lib/api';

export async function POST(request: Request) {
  // Authenticate user
  const user = await authenticateRequest();
  if (!user) {
    return authenticationError();
  }

  try {
    // Validate encryption key exists
    validateEnvVar('ENCRYPTION_KEY');

    const body: SetupWalletRequest = await request.json();
    const { username, address } = body;

    // Validate required fields
    if (!validateRequiredFields(body, ['username', 'address'])) {
      return errorResponse('Missing required fields', 103, 400);
    }

    const db = admin.firestore();
    const batch = db.batch();

    const usernameDoc = db.doc(`usernames/${username}`);
    const userDoc = db.doc(`users/${user.uid}`);

    const userData = {
      isWallet: true,
      username: username,
      ethereumAddress: address,
      holders: 0,
      points: 0,
      displayName: '',
      photoURL: '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    batch.set(usernameDoc, { uid: user.uid });
    batch.set(userDoc, userData);

    await batch.commit();

    return NextResponse.json({ message: 'Wallet Created' }, { status: 200 });
  } catch (error) {
    return internalError(error);
  }
}
