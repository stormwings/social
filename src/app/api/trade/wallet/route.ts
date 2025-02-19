export const maxDuration = 60;

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { ethers } from "ethers";

import admin from "@/lib/firebase-admin";
import * as dappParams from "@/lib/dappParams";

import contractAbi from "./../../../../usersKeysAbi";
import usdtTokenAbi from "../../../../usdtTokenAbi";

const provider = new ethers.JsonRpcProvider(dappParams.RPC_ENDPOINT);

export async function POST(request: Request) {
  const trade = await request.json();

  const tradeType = trade["type"];
  const subjectUID = trade["subjectUID"];
  const amount = trade["amount"];
  const ethereumAddress = trade["userAddress"];

  const headersList = headers();
  const authHeader = headersList.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Not authenticated", error: 101 });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    if (!decodedToken) {
      return NextResponse.json({ message: "Not authenticated", error: 101 });
    }

    const subjectRef = admin.firestore().collection("users").doc(subjectUID);

    const subjectDoc = await subjectRef.get();

    if (!subjectDoc.exists) {
      return NextResponse.json({ message: "Subject not found", error: 102 });
    }

    const subjectKey = subjectDoc.data()?.ethereumAddress;

    if (tradeType === "buy") {
      const usdtContract = new ethers.Contract(
        dappParams.usdtAddress,
        usdtTokenAbi,
        provider
      );
      const userUsdtBalance = await usdtContract.balanceOf(ethereumAddress);

      const usersKeysCContract = new ethers.Contract(
        dappParams.usersKeysAddress,
        contractAbi,
        provider
      );
      const usdtPriceForKeys = await usersKeysCContract.getBuyPrice(
        subjectKey,
        amount
      );

      if (userUsdtBalance < usdtPriceForKeys) {
        return NextResponse.json({ message: "Insufficient USDT balance" });
      }

      return NextResponse.json({
        message: "Ready for frontend to handle buy operation",
        usdtPriceForKeys: ethers.formatEther(usdtPriceForKeys),
        subjectKey,
        ok: true,
      });
    } else if (tradeType === "sell") {
      const usersKeysCContract = new ethers.Contract(
        dappParams.usersKeysAddress,
        contractAbi,
        provider
      );

      const userKeyCount = await usersKeysCContract.keysBalance(
        subjectKey,
        ethereumAddress
      );

      if (Number(userKeyCount) < amount) {
        return NextResponse.json({ message: "Insufficient keys to sell" });
      }

      return NextResponse.json({
        message: "Ready for frontend to handle sell operation",
        userKeyCount: Number(userKeyCount),
        keysToSell: amount,
        subjectKey,
        ok: true,
      });
    }
  } catch (error) {
    function isErrorWithCode(error: unknown): error is { code: string } {
      return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof (error as any).code === "string"
      );
    }
    if (isErrorWithCode(error) && error.code === "auth/id-token-expired") {
      return NextResponse.json({ message: "Token expired" });
    } else {
      console.error("Error processing trade:", error);
      return NextResponse.json({ message: "Internal Server Error" });
    }
  }
}
