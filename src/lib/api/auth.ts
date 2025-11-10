import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import admin from '@/lib/firebase-admin';
import { ErrorResponse } from './types';

/**
 * Error codes used across the API
 */
export enum ErrorCode {
  NOT_AUTHENTICATED = 101,
  USER_NOT_FOUND = 102,
  INVALID_PARAMETERS = 103,
  INTERNAL_ERROR = 500,
}

/**
 * Verifies the Firebase ID token from the Authorization header
 * @returns User's decoded token or null if authentication fails
 */
export async function authenticateRequest(): Promise<{ uid: string } | null> {
  try {
    const headersList = headers();
    const authHeader = headersList.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    if (!decodedToken?.uid) {
      return null;
    }

    return { uid: decodedToken.uid };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Creates a standardized error response
 */
export function errorResponse(
  message: string,
  errorCode?: ErrorCode | number,
  status: number = 401
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      message,
      error: errorCode,
    },
    { status }
  );
}

/**
 * Creates a standardized success response
 */
export function successResponse<T>(
  message: string,
  data?: T,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      message,
      ...(data && { ...data }),
      ok: true,
    },
    { status }
  );
}

/**
 * Handles authentication errors consistently
 */
export function authenticationError(): NextResponse<ErrorResponse> {
  return errorResponse('Not authenticated', ErrorCode.NOT_AUTHENTICATED);
}

/**
 * Handles internal server errors consistently
 */
export function internalError(error?: unknown): NextResponse<ErrorResponse> {
  console.error('Internal server error:', error);
  return errorResponse('Internal Server Error', ErrorCode.INTERNAL_ERROR, 500);
}
