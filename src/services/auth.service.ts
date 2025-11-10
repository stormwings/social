/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls and operations.
 * Used by authHooks for managing authentication state and flows.
 */

import axios from "axios";
import { signInWithPopup, signInWithCustomToken } from "firebase/auth";
import { ethers } from "ethers";
import { auth, googleAuthProvider } from "@/lib/firebase";
import { ENDPOINTS } from "@/lib/apiEndpoints";
import { logger } from "@/lib/logger";
import toast from "react-hot-toast";

/**
 * Interface for username creation request
 */
export interface CreateUsernameRequest {
  username: string;
  address?: string | null;
}

/**
 * Interface for wallet verification request
 */
export interface VerifyWalletRequest {
  address: string;
  signature: string;
  message: string;
}

/**
 * Create user account with server-generated wallet
 * Used by Google-authenticated users
 * 
 * @param username - Desired username
 * @param token - Firebase ID token
 * @returns API response
 */
export async function createUserWithGeneratedWallet(
  username: string,
  token: string
): Promise<any> {
  try {
    const response = await axios.post(
      ENDPOINTS.CREATE_WITH_GENERATED_WALLET,
      { username },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  } catch (error) {
    logger.error("Failed to create user with generated wallet", error, { username });
    throw error;
  }
}

/**
 * Create user account with existing wallet
 * Used by wallet-authenticated users
 * 
 * @param username - Desired username
 * @param address - Ethereum wallet address
 * @param token - Firebase ID token
 * @returns API response
 */
export async function createUserWithExistingWallet(
  username: string,
  address: string,
  token: string
): Promise<any> {
  try {
    const response = await axios.post(
      ENDPOINTS.CREATE_WITH_EXISTING_WALLET,
      { username, address },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  } catch (error) {
    logger.error("Failed to create user with existing wallet", error, { username, address });
    throw error;
  }
}

/**
 * Verify wallet signature and get Firebase custom token
 * 
 * @param address - Ethereum wallet address
 * @param signature - Signed message
 * @param message - Original message that was signed
 * @returns Firebase custom token
 */
export async function verifyWalletSignature(
  address: string,
  signature: string,
  message: string
): Promise<string> {
  try {
    const response = await axios.post(ENDPOINTS.VERIFY_WALLET, {
      address,
      signature,
      message,
    });
    return response.data.token;
  } catch (error) {
    logger.error("Failed to verify wallet signature", error, { address });
    throw error;
  }
}

/**
 * Sign in with Google using Firebase popup
 * 
 * @returns Firebase user credential
 */
export async function signInWithGoogle() {
  try {
    return await signInWithPopup(auth, googleAuthProvider);
  } catch (error) {
    logger.error("Failed to sign in with Google", error);
    throw error;
  }
}

/**
 * Sign in with wallet by signing a message and verifying on backend
 * 
 * @returns Object containing address and Firebase user credential
 */
export async function signInWithWallet(): Promise<{ address: string }> {
  try {
    if (!(window as any).ethereum) {
      const errorMsg = "No Ethereum wallet detected";
      logger.error(errorMsg);
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    const message = "signin";
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const signature = await signer.signMessage(message);
    const address = await signer.getAddress();

    const token = await verifyWalletSignature(address, signature, message);
    await signInWithCustomToken(auth, token);

    return { address };
  } catch (error) {
    logger.error("Failed to sign in with wallet", error);
    if (error instanceof Error && error.message.includes("user rejected")) {
      toast.error("Wallet connection rejected");
    }
    throw error;
  }
}

/**
 * Auth Service API
 */
export const authService = {
  createUserWithGeneratedWallet,
  createUserWithExistingWallet,
  verifyWalletSignature,
  signInWithGoogle,
  signInWithWallet,
};
