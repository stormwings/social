/**
 * API Request and Response Types
 * Centralized type definitions for API routes
 */

export interface AuthenticatedRequest {
  uid: string;
}

export interface ErrorResponse {
  message: string;
  error?: number | string | unknown;
}

export interface SuccessResponse<T = unknown> {
  message: string;
  data?: T;
  ok?: boolean;
}

// Post API Types
export interface MintPostRequest extends Record<string, unknown> {
  userUID: string;
  postId: string;
  tokenId: string;
  ethereumAddress: string;
}

export interface TipRequest extends Record<string, unknown> {
  fromUser: string;
  toUser: string;
  amount: number;
  transactionHash: string;
}

// Setup API Types
export interface SetupRequest extends Record<string, unknown> {
  username: string;
}

export interface SetupWalletRequest extends Record<string, unknown> {
  username: string;
  address: string;
}

// Token API Types
export interface TokenRequest extends Record<string, unknown> {
  address: string;
  message: string;
  signature: string;
}

// Trade API Types
export interface TradeRequest extends Record<string, unknown> {
  type: 'buy' | 'sell';
  subjectUID: string;
  amount: number;
  userAddress?: string;
}

export interface TradeConfirmRequest extends Record<string, unknown> {
  ethereumAddress: string;
  subjectUID: string;
  amount: number;
  userUID: string;
  txHash: string;
  tradeType: 'buy' | 'sell';
}

// Withdraw API Types
export interface WithdrawRequest extends Record<string, unknown> {
  amount: number;
  address: string;
}
