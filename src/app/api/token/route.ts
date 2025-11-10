import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import admin from '@/lib/firebase-admin';
import { errorResponse, internalError, validateRequiredFields } from '@/lib/api';
import type { TokenRequest } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const body: TokenRequest = await request.json();
    const { address, message, signature } = body;

    // Validate required fields
    if (!validateRequiredFields(body, ['address', 'message', 'signature'])) {
      return errorResponse('Missing required fields', 400, 400);
    }

    // Verify the signature
    const addressVerified = ethers.verifyMessage(message, signature);

    if (addressVerified.toLowerCase() !== address.toLowerCase()) {
      return errorResponse('Signature verification failed', 400, 400);
    }

    // Create custom token for the verified address
    const customToken = await admin.auth().createCustomToken(address);

    return NextResponse.json({ token: customToken }, { status: 200 });
  } catch (error) {
    return internalError(error);
  }
}
