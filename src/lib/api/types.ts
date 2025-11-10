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
export interface MintPostRequest {
  userUID: string;
  postId: string;
  tokenId: string;
  ethereumAddress: string;
}

export interface TipRequest {
  fromUser: string;
  toUser: string;
  amount: number;
  transactionHash: string;
}

// Setup API Types
export interface SetupRequest {
  username: string;
}

export interface SetupWalletRequest {
  username: string;
  address: string;
}

// Token API Types
export interface TokenRequest {
  address: string;
  message: string;
  signature: string;
}

// Trade API Types
export interface TradeRequest {
  type: 'buy' | 'sell';
  subjectUID: string;
  amount: number;
  userAddress?: string;
}

export interface TradeConfirmRequest {
  ethereumAddress: string;
  subjectUID: string;
  amount: number;
  userUID: string;
  txHash: string;
  tradeType: 'buy' | 'sell';
}

// Withdraw API Types
export interface WithdrawRequest {
  amount: number;
  address: string;
}
