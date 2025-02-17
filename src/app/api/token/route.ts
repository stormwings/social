import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

import admin from '@/lib/firebase-admin';

export async function POST(request: Request) {
    const { address, message, signature }  = await request.json();

    try {
        const addressVerified = ethers.verifyMessage(message, signature)

        if (addressVerified.toLowerCase() !== address.toLowerCase()) {
          return NextResponse.json({ message: "Signature verification failed", error: 400 });
        }

        const customToken = await admin.auth().createCustomToken(address);

        return NextResponse.json({ token: customToken }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ log: error, message: 'Internal Error', error: 101 }, { status: 500 });
    }
}
