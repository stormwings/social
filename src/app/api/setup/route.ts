import { NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import { Wallet } from 'ethers';
import {
  authenticateRequest,
  authenticationError,
  encryptPrivateKey,
  errorResponse,
  internalError,
  validateEnvVar,
  validateRequiredFields,
} from '@/lib/api';
import type { SetupRequest } from '@/lib/api';

export async function POST(request: Request) {
  // Authenticate user
  const user = await authenticateRequest();
  if (!user) {
    return authenticationError();
  }

  try {
    // Validate encryption key exists
    const encryptionKey = validateEnvVar('ENCRYPTION_KEY');

    const body: SetupRequest = await request.json();
    const { username } = body;

    // Validate required fields
    if (!validateRequiredFields(body, ['username'])) {
      return errorResponse('Missing required fields', 103, 400);
    }

    const db = admin.firestore();
    const walletRef = db.collection('wallets').doc(user.uid);
    const walletDoc = await walletRef.get();

    // Check if wallet already exists
    if (walletDoc.exists) {
      return NextResponse.json(
        { message: 'Wallet Already Created', error: 102 },
        { status: 201 }
      );
    }

    // Generate Ethereum wallet
    const wallet = Wallet.createRandom();
    const privateKey = wallet.privateKey;
    const address = wallet.address;

    // Encrypt the private key
    const encryptedData = encryptPrivateKey(privateKey, encryptionKey);

    // Prepare batch write
    const batch = db.batch();

    const usernameDoc = db.doc(`usernames/${username}`);
    batch.set(usernameDoc, { uid: user.uid });

    const walletData = {
      userId: user.uid,
      ethereumAddress: address,
      encryptedPrivateKey: encryptedData,
      encryptedVersion: 1,
      username: username,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    batch.set(walletRef, walletData);

    const userData = {
      username: username,
      ethereumAddress: address,
      holders: 0,
      points: 0,
      displayName: '',
      photoURL: '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const userDoc = db.doc(`users/${user.uid}`);
    batch.set(userDoc, userData);

    await batch.commit();

    return NextResponse.json({ message: 'Wallet Created' }, { status: 200 });
  } catch (error) {
    return internalError(error);
  }
}
