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

import contractAbi from './../usersKeysAbi';
import usdtTokenAbi from '../usdtTokenAbi';

/**
 * Get signer from browser wallet
 */
const getSigner = async () => {
  const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await browserProvider.getSigner();  

  return signer;
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
  if (!user || !ethereumAddress) return;

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
      // (refactor) We will handle this at the end in the component that calls this function so you must send the response to the component whether correct or incorrect to identify
      toast.error("User USDT balance too low " + ethereumAddress + " " + ethers.formatEther(userUsdtBalance) + " < " + ethers.formatEther(usdtPriceForKeys));
      return;
    }

    const currentAllowance = await usdtContract.allowance(
      ethereumAddress,
      dappParams.usersKeysAddress
    );

    if (currentAllowance < usdtPriceForKeys) {
      const approveTx = await usdtContract.approve(
        dappParams.usersKeysAddress,
        usdtPriceForKeys * BigInt(10)
      );

      await approveTx.wait();
    }

    toast.success(
      `Permiso de Compra aprobado con éxito.`
    );

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

    // (refactor) We will handle this at the end in the component that calls this function so you must send the response to the component whether correct or incorrect to identify
    toast.success(
      `Operación de compra realizada con éxito. Hash de transacción: ${tx.hash}`
    );

    return responseData;
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

    // (refactor) We will handle this at the end in the component that calls this function so you must send the response to the component whether correct or incorrect to identify
    if (response.ok) {
      toast.success('Purchase successful');
    } else {
      toast.error(responseData.message || "Failed to buy key");
    }

    return responseData;
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
  if (!user || !ethereumAddress) return;

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
      // (refactor) We will handle this at the end in the component that calls this function so you must send the response to the component whether correct or incorrect to identify
      toast.error("Operation not allowed");
      return;
    }

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

    toast.success(`Venta realizada con éxito. Hash de transacción: ${tx.hash}`);

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

    // (refactor) We will handle this at the end in the component that calls this function so you must send the response to the component whether correct or incorrect to identify
    if (response.ok) {
      toast.success('Sell successful');
    } else {
      toast.error(confirmationData.message || "Failed to buy key");
    }

    return {
      success: true,
      message: "Venta completada correctamente",
      txHash: tx.hash,
      data: confirmationData
    };
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

    // (refactor) We will handle this at the end in the component that calls this function so you must send the response to the component whether correct or incorrect to identify
    if (response.ok) {
      toast.success('Sell success!!');
    } else {
      toast.error(responseData.message || "Failed to sell key");
    }

    return responseData;
  }
}

/**
 * Trade Service API
 */
export const tradeService = {
  handleBuyKey,
  handleSellKey,
};
