import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { firestore } from 'firebase-admin';

import admin from '@/lib/firebase-admin';

export async function POST(request: Request) {
  const {
    fromUser,
    toUser,
    amount,
    transactionHash,
  } = await request.json();

  if (!fromUser || !toUser || !amount || amount <= 0 || !transactionHash) {
    return NextResponse.json({ message: 'Invalid request parameters.', error: 103 });
  }

  const headersList = headers()
  const authHeader = headersList.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: "Not authenticated", error: 101 });
  }

  const token = authHeader.split('Bearer ')[1];
  const decodedToken = await admin.auth().verifyIdToken(token);

  if (!decodedToken) {
      return NextResponse.json({ message: "Not authenticated", error: 101 });
  }

  try {
    const db = admin.firestore();
    const tipRef = db.collection('tips').doc();

    await tipRef.set({
      fromUser,
      toUser,
      amount,
      timestamp: firestore.FieldValue.serverTimestamp(),
      transactionHash
    });

    return NextResponse.json({ message: 'Tip registered successfully.', id: tipRef.id });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error", error: error });
  }
}
