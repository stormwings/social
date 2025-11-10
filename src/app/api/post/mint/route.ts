import { NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import {
  authenticateRequest,
  authenticationError,
  errorResponse,
  internalError,
  successResponse,
  validateRequiredFields,
} from '@/lib/api';
import type { MintPostRequest } from '@/lib/api';

export async function POST(request: Request) {
  // Authenticate user
  const user = await authenticateRequest();
  if (!user) {
    return authenticationError();
  }

  try {
    const body: MintPostRequest = await request.json();
    const { userUID, postId, tokenId, ethereumAddress } = body;

    // Validate required fields
    if (!validateRequiredFields(body, ['userUID', 'postId', 'tokenId', 'ethereumAddress'])) {
      return errorResponse('Missing required fields', 103, 400);
    }

    const db = admin.firestore();
    const postRef = db
      .collection('users')
      .doc(userUID)
      .collection('posts')
      .doc(postId);

    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return errorResponse('Post not found', 404, 404);
    }

    // Update post with owner key and token ID
    await postRef.update({
      ownerKey: ethereumAddress,
      tokenId: tokenId,
    });

    return successResponse('Operation processed');
  } catch (error) {
    return internalError(error);
  }
}
