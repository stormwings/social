/**
 * API Endpoints Constants
 *
 * Centralized location for all API endpoint URLs used throughout the application.
 * Organized by feature domain for easy maintenance and scalability.
 */

// ============================================================================
// BASE PATHS
// ============================================================================

const API_BASE = '/api';

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

export const AUTH_ENDPOINTS = {
  /**
   * Verify wallet signature and issue Firebase custom token
   * Method: POST
   * Used by: Wallet-authenticated users
   */
  VERIFY_WALLET: `${API_BASE}/token`,
} as const;

// ============================================================================
// ACCOUNT SETUP ENDPOINTS
// ============================================================================

export const SETUP_ENDPOINTS = {
  /**
   * Create account with server-generated wallet
   * Method: POST
   * Used by: Google-authenticated users
   */
  CREATE_WITH_GENERATED_WALLET: `${API_BASE}/setup`,

  /**
   * Create account with user's existing wallet
   * Method: POST
   * Used by: Wallet-authenticated users
   */
  CREATE_WITH_EXISTING_WALLET: `${API_BASE}/setup/wallet`,
} as const;

// ============================================================================
// TRADING ENDPOINTS
// ============================================================================

export const TRADE_ENDPOINTS = {
  /**
   * Execute trade server-side (buy/sell keys)
   * Method: POST
   * Used by: Google-authenticated users (server controls private key)
   */
  EXECUTE_TRADE: `${API_BASE}/trade`,

  /**
   * Validate trade parameters before client-side execution
   * Method: POST
   * Used by: Wallet-authenticated users (client-side signing)
   */
  VALIDATE_WALLET_TRADE: `${API_BASE}/trade/wallet`,

  /**
   * Record completed blockchain transaction in Firestore
   * Method: POST
   * Used by: Wallet-authenticated users (after on-chain tx)
   */
  CONFIRM_WALLET_TRADE: `${API_BASE}/trade/wallet/confirm`,
} as const;

// ============================================================================
// WITHDRAWAL ENDPOINTS
// ============================================================================

export const WITHDRAWAL_ENDPOINTS = {
  /**
   * Withdraw USDT to external address
   * Method: POST
   */
  WITHDRAW_USDT: `${API_BASE}/withdraw`,
} as const;

// ============================================================================
// POST/CONTENT ENDPOINTS
// ============================================================================

export const POST_ENDPOINTS = {
  /**
   * Record post NFT mint transaction
   * Method: POST
   * Status: Currently not implemented (commented out)
   */
  MINT_POST_NFT: `${API_BASE}/post/mint`,

  /**
   * Record tip sent to post
   * Method: POST
   * Status: API route exists but not yet called from client
   */
  TIP_POST: `${API_BASE}/post/tip`,
} as const;

// ============================================================================
// COMBINED EXPORTS
// ============================================================================

/**
 * All API endpoints organized by domain
 */
export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  SETUP: SETUP_ENDPOINTS,
  TRADE: TRADE_ENDPOINTS,
  WITHDRAWAL: WITHDRAWAL_ENDPOINTS,
  POST: POST_ENDPOINTS,
} as const;

/**
 * Flat export of all endpoint values for easy access
 */
export const ENDPOINTS = {
  // Auth
  VERIFY_WALLET: AUTH_ENDPOINTS.VERIFY_WALLET,

  // Setup
  CREATE_WITH_GENERATED_WALLET: SETUP_ENDPOINTS.CREATE_WITH_GENERATED_WALLET,
  CREATE_WITH_EXISTING_WALLET: SETUP_ENDPOINTS.CREATE_WITH_EXISTING_WALLET,

  // Trade
  EXECUTE_TRADE: TRADE_ENDPOINTS.EXECUTE_TRADE,
  VALIDATE_WALLET_TRADE: TRADE_ENDPOINTS.VALIDATE_WALLET_TRADE,
  CONFIRM_WALLET_TRADE: TRADE_ENDPOINTS.CONFIRM_WALLET_TRADE,

  // Withdrawal
  WITHDRAW_USDT: WITHDRAWAL_ENDPOINTS.WITHDRAW_USDT,

  // Posts
  MINT_POST_NFT: POST_ENDPOINTS.MINT_POST_NFT,
  TIP_POST: POST_ENDPOINTS.TIP_POST,
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/**
 * TypeScript types for endpoint values
 */
export type AuthEndpoint = typeof AUTH_ENDPOINTS[keyof typeof AUTH_ENDPOINTS];
export type SetupEndpoint = typeof SETUP_ENDPOINTS[keyof typeof SETUP_ENDPOINTS];
export type TradeEndpoint = typeof TRADE_ENDPOINTS[keyof typeof TRADE_ENDPOINTS];
export type WithdrawalEndpoint = typeof WITHDRAWAL_ENDPOINTS[keyof typeof WITHDRAWAL_ENDPOINTS];
export type PostEndpoint = typeof POST_ENDPOINTS[keyof typeof POST_ENDPOINTS];
export type ApiEndpoint = typeof ENDPOINTS[keyof typeof ENDPOINTS];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Build full URL with query parameters
 * @param endpoint - API endpoint path
 * @param params - Query parameters object
 * @returns Full URL with encoded query string
 *
 * @example
 * buildUrl('/api/users', { id: '123', filter: 'active' })
 * // Returns: '/api/users?id=123&filter=active'
 */
export function buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
  if (!params) return endpoint;

  const queryString = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)])
  ).toString();

  return `${endpoint}?${queryString}`;
}

/**
 * Check if an endpoint requires authentication
 * @param endpoint - API endpoint path
 * @returns True if endpoint requires auth header
 */
export function requiresAuth(endpoint: string): boolean {
  // All internal API endpoints require authentication
  return endpoint.startsWith(API_BASE);
}
