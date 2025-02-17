import { NextResponse } from 'next/server';
import { headers } from 'next/headers'

import admin from '@/lib/firebase-admin';

export async function POST(request: Request) {
    const headersList = headers()
    const authHeader = headersList.get('Authorization')
    const setup_data  = await request.json();
    const username = setup_data.username;
    const address = setup_data.address;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ message: "Not authenticated", error: 101 });
    }

    const token = authHeader.split('Bearer ')[1];

    if (!process.env.ENCRYPTION_KEY) {
        console.log("No encryption key");
        return NextResponse.json({ message: "Internal Error", error: 101 });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);

        if (!decodedToken) {
            return NextResponse.json({ message: "Not authenticated", error: 101 });
        }

        const userData = {
          isWallet: true, // (pending) request firebase
          username: username,
          ethereumAddress: address,
          holders: 0,
          points: 0,
          displayName: "",
          photoURL: "",
          createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

        const db = admin.firestore();
        const batch = db.batch();

        const usernameDoc = db.doc(`usernames/${username}`);
        const userDoc = db.doc(`users/${decodedToken.uid}`);

        batch.set(usernameDoc, { uid: decodedToken.uid });
        batch.set(userDoc, userData);

        await batch.commit();

        return NextResponse.json({ message: "Wallet Created" }, { status: 200});
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: 'Internal Error', error: 101 }, { status: 500 });
    }
}
