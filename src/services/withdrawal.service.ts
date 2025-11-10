/**
 * Withdrawal Service
 * 
 * Handles all withdrawal-related API calls and operations.
 * Used by utilityHooks for managing USDT withdrawals.
 */

import axios from "axios";
import { ENDPOINTS } from "@/lib/apiEndpoints";

/**
 * Interface for withdrawal request
 */
export interface WithdrawRequest {
  address: string;
  amount: number;
}

/**
 * Interface for withdrawal response
 */
export interface WithdrawResponse {
  message: string;
  success?: boolean;
  txHash?: string;
}

/**
 * Withdraw USDT to external address
 * 
 * @param data - Withdrawal request data (address and amount)
 * @param token - Firebase ID token for authentication
 * @returns Withdrawal response from API
 * @throws Error if withdrawal fails
 */
export async function withdrawUsdt(
  data: WithdrawRequest,
  token: string
): Promise<WithdrawResponse> {
  try {
    const response = await axios.post(ENDPOINTS.WITHDRAW_USDT, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to withdraw USDT"
      );
    }
    throw error;
  }
}

/**
 * Withdrawal Service API
 */
export const withdrawalService = {
  withdrawUsdt,
};
