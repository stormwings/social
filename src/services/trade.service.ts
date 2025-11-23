/**
 * Trade Service
 * 
 * Handles all trading-related operations including buy/sell keys.
 * Supports both wallet-authenticated (client-side signing) and 
 * Google-authenticated (server-side signing) flows.
 */

import { ethers } from 'ethers';
import toast from 'react-hot-toast';

import * as dappParams from '@/lib/dappParams';
import { ENDPOINTS } from '@/lib/apiEndpoints';
import { logger } from '@/lib/logger';

import contractAbi from './../usersKeysAbi';
import usdtTokenAbi from '../usdtTokenAbi';

/**
 * Get signer from browser wallet
 */
const getSigner = async () => {
  try {
    if (!(window as any).ethereum) {
      const errorMsg = "No Ethereum wallet detected. Please install MetaMask.";
      logger.error(errorMsg);
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await browserProvider.getSigner();  

    return signer;
  } catch (error) {
    logger.error("Failed to get signer from wallet", error);
    throw error;
  }
}

/**
 * Interface for buy/sell key request
 */
export interface TradeKeyRequest {
  user: any;
  ethereumAddress: string;
  subjectUID: string;
  numberOfKeys: string | number;
  useWallet?: boolean;
}

/**
 * Interface for trade response
 */
export interface TradeResponse {
  success?: boolean;
  message?: string;
  txHash?: string;
  data?: any;
}

/**
 * Buy keys for a subject
 * Supports both wallet-authenticated and server-side flows
 * 
 * @param request - Buy key request parameters
 * @returns Trade response with transaction details
 */
export const handleBuyKey = async ({
  user,
  ethereumAddress,
  subjectUID,
  numberOfKeys,
  useWallet = false,
}: TradeKeyRequest): Promise<TradeResponse | undefined> => {
  if (!user || !ethereumAddress) {
    logger.warn("Buy key attempted without user or address", { user: !!user, ethereumAddress });
    return;
  }

  try {
    const token = await user.getIdToken();

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    if (useWallet) {
      const response = await fetch(ENDPOINTS.VALIDATE_WALLET_TRADE, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          type: "buy",
          subjectUID,
          amount: numberOfKeys,
          userAddress: ethereumAddress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        logger.error("Wallet trade validation failed", null, { status: response.status, errorData });
        toast.error(errorData.message || "Failed to validate trade");
        return;
      }

      const tradeInfo = await response.json();

      const signer = await getSigner();

      const usdtContract = new ethers.Contract(
        dappParams.usdtAddress,
        usdtTokenAbi,
        signer
      );

      const usersKeysCContract = new ethers.Contract(
        dappParams.usersKeysAddress,
        contractAbi,
        signer
      );

      const userUsdtBalance = await usdtContract.balanceOf(
        ethereumAddress
      );
      
      const usdtPriceForKeys = await usersKeysCContract.getBuyPrice(
        tradeInfo.subjectKey,
        numberOfKeys
      );

      if (userUsdtBalance < usdtPriceForKeys) {
        const errorMsg = `Insufficient USDT balance. You have ${ethers.formatEther(userUsdtBalance)} USDT but need ${ethers.formatEther(usdtPriceForKeys)} USDT`;
        logger.warn("Insufficient USDT balance for trade", { 
          balance: ethers.formatEther(userUsdtBalance), 
          required: ethers.formatEther(usdtPriceForKeys) 
        });
        toast.error(errorMsg);
        return;
      }

      const currentAllowance = await usdtContract.allowance(
        ethereumAddress,
        dappParams.usersKeysAddress
      );

      if (currentAllowance < usdtPriceForKeys) {
        try {
          const approveTx = await usdtContract.approve(
            dappParams.usersKeysAddress,
            usdtPriceForKeys * BigInt(10)
          );

          await approveTx.wait();
          toast.success(`Purchase approval granted successfully`);
        } catch (error) {
          logger.error("Failed to approve USDT spend", error);
          toast.error("Failed to approve USDT spending. Please try again.");
          throw error;
        }
      }

      try {
        const tx = await usersKeysCContract.buyKeys(
          tradeInfo.subjectKey,
          numberOfKeys,
        );

        await tx.wait();

        const responseConfirmation = await fetch(ENDPOINTS.CONFIRM_WALLET_TRADE, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            ethereumAddress,
            subjectUID,
            amount: numberOfKeys,
            userUID: user.uid,
            txHash: tx.hash,
            tradeType: "buy",
          }),
        });
      
        const responseData = await responseConfirmation.json();

        logger.info("Buy trade completed successfully", { txHash: tx.hash, subjectUID, amount: numberOfKeys });
        toast.success(`Purchase successful! Transaction: ${tx.hash}`);

        return responseData;
      } catch (error) {
        logger.error("Failed to execute buy transaction", error, { subjectUID, numberOfKeys });
        toast.error("Transaction failed. Please try again.");
        throw error;
      }
    } else {
      const response = await fetch(ENDPOINTS.EXECUTE_TRADE, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          type: 'buy',
          subjectUID,
          amount: numberOfKeys,
          ethereumAddress,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        logger.info("Server-side buy trade completed", { subjectUID, amount: numberOfKeys });
        toast.success('Purchase successful');
      } else {
        logger.error("Server-side buy trade failed", null, { status: response.status, responseData });
        toast.error(responseData.message || "Failed to buy key");
      }

      return responseData;
    }
  } catch (error) {
    logger.error("Unexpected error in handleBuyKey", error, { subjectUID, numberOfKeys });
    if (error instanceof Error && error.message.includes("user rejected")) {
      toast.error("Transaction was rejected");
    } else {
      toast.error("An unexpected error occurred");
    }
    throw error;
  }
}

/**
 * Sell keys for a subject
 * Supports both wallet-authenticated and server-side flows
 * 
 * @param request - Sell key request parameters
 * @returns Trade response with transaction details
 */
export const handleSellKey = async ({
  user,
  ethereumAddress,
  subjectUID,
  numberOfKeys,
  useWallet = false,
}: TradeKeyRequest): Promise<TradeResponse | undefined> => {
  if (!user || !ethereumAddress) {
    logger.warn("Sell key attempted without user or address", { user: !!user, ethereumAddress });
    return;
  }

  try {
    const token = await user.getIdToken();

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    if (useWallet) {
      const response = await fetch(ENDPOINTS.VALIDATE_WALLET_TRADE, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          type: "sell",
          subjectUID,
          amount: numberOfKeys,
          userAddress: ethereumAddress,
        }),
      });

      const tradeInfo = await response.json();

      if (!tradeInfo.ok) {
        logger.warn("Sell trade validation failed", { tradeInfo });
        toast.error("Operation not allowed");
        return;
      }

      try {
        const signer = await getSigner();

        const usersKeysCContract = new ethers.Contract(
          dappParams.usersKeysAddress,
          contractAbi,
          signer
        );

        const tx = await usersKeysCContract.sellKeys(
          tradeInfo.subjectKey,
          tradeInfo.keysToSell,
        );

        await tx.wait();

        toast.success(`Sale successful! Transaction: ${tx.hash}`);

        const confirmationResponse = await fetch(ENDPOINTS.CONFIRM_WALLET_TRADE, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            ethereumAddress,
            subjectUID,
            amount: numberOfKeys,
            userUID: user.uid,
            txHash: tx.hash,
            tradeType: "sell",
          }),
        });

        const confirmationData = await confirmationResponse.json();

        if (confirmationResponse.ok) {
          logger.info("Sell trade completed successfully", { txHash: tx.hash, subjectUID, amount: numberOfKeys });
          toast.success('Sell successful');
        } else {
          logger.error("Sell confirmation failed", null, { confirmationData });
          toast.error(confirmationData.message || "Failed to confirm sell");
        }

        return {
          success: true,
          message: "Sale completed successfully",
          txHash: tx.hash,
          data: confirmationData
        };
      } catch (error) {
        logger.error("Failed to execute sell transaction", error, { subjectUID, numberOfKeys });
        toast.error("Transaction failed. Please try again.");
        throw error;
      }
    } else {
      const response = await fetch(ENDPOINTS.EXECUTE_TRADE, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          type: 'sell',
          subjectUID,
          amount: numberOfKeys,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        logger.info("Server-side sell trade completed", { subjectUID, amount: numberOfKeys });
        toast.success('Sell success!!');
      } else {
        logger.error("Server-side sell trade failed", null, { status: response.status, responseData });
        toast.error(responseData.message || "Failed to sell key");
      }

      return responseData;
    }
  } catch (error) {
    logger.error("Unexpected error in handleSellKey", error, { subjectUID, numberOfKeys });
    if (error instanceof Error && error.message.includes("user rejected")) {
      toast.error("Transaction was rejected");
    } else {
      toast.error("An unexpected error occurred");
    }
    throw error;
  }
}

/**
 * Trade Service API
 */
export const tradeService = {
  handleBuyKey,
  handleSellKey,
};
