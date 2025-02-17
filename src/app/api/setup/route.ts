import { NextResponse } from 'next/server';
import { headers } from 'next/headers'

import admin from '@/lib/firebase-admin';

import { Wallet } from 'ethers';
import crypto from 'crypto';

export async function POST(request: Request) {
    const headersList = headers()
    const authHeader = headersList.get('Authorization')
    const setup_data  = await request.json();
    const username = setup_data.username;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ message: "Not authenticated", error: 101 });
    }

    const token = authHeader.split('Bearer ')[1];

    if (!process.env.ENCRYPTION_KEY) {
        console.log("No encryption key");
        return NextResponse.json({ message: "Internal Error", error: 101 });
    }

    try {
        // Verify the token
        const decodedToken = await admin.auth().verifyIdToken(token);
        if (!decodedToken) {
            return NextResponse.json({ message: "Not authenticated", error: 101 });
        }

        const uid = decodedToken.uid;
        console.log("creating wallet for uid", uid);

        const db = admin.firestore();
    
        // Generate Ethereum Keys
        const wallet = Wallet.createRandom();
        const privateKey = wallet.privateKey;
        const address = wallet.address;

        // Generate a random initialization vector (IV) for each encryption
        const iv = crypto.randomBytes(12);

        // Create AES-GCM cipher using the ENCRYPTION_KEY and IV
        const cipher = crypto.createCipheriv(
          'aes-256-gcm', 
          Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'), 
          iv
        );

        // Encrypt the private key
        let encryptedPrivateKey = cipher.update(privateKey, 'utf8', 'hex');
        encryptedPrivateKey += cipher.final('hex');

        // Concatenate IV and the authentication tag to the encrypted private key to store in the database
        const encryptedData = `${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${encryptedPrivateKey}`;

        // Write to Firestore

        const walletRef = db.collection('wallets').doc(uid);
        const usernameDoc = db.doc(`usernames/${username}`);

        const walletDoc = await walletRef.get();

        if (walletDoc.exists) {
            return NextResponse.json({ message: "Wallet Already Created", error: 102 }, { status: 201});
        }

        const batch = db.batch();

        batch.set(usernameDoc, { uid });

        const walletData = {
            userId: uid,
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
            displayName: "",
            photoURL: "",
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        const userDoc = db.doc(`users/${uid}`);
        batch.set(userDoc, userData);

        await batch.commit();

        return NextResponse.json({ message: "Wallet Created" }, { status: 200});
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: 'Internal Error', error: 101 }, { status: 500 });
    }
}
