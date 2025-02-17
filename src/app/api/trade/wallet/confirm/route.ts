import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { ethers } from "ethers";

import admin from "@/lib/firebase-admin";
import { RPC_ENDPOINT, usersKeysAddress } from "@/lib/dappParams";

import contractAbi from "../../../../../usersKeysAbi";

const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT);

export async function POST(request: Request) {
  const { ethereumAddress, subjectUID, amount, userUID, txHash, tradeType } =
    await request.json();

  const headersList = headers();
  const authHeader = headersList.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Not authenticated", error: 101 });
  }

  const token = authHeader.split("Bearer ")[1];
  const decodedToken = await admin.auth().verifyIdToken(token);

  if (!decodedToken) {
    return NextResponse.json({ message: "Not authenticated", error: 101 });
  }

  try {
    const db = admin.firestore();

    // Sets up references to Firestore collections for users, subjects, trades, and chats.
    const userRef = db.collection("users").doc(userUID);
    const subjectRef = db.collection("users").doc(subjectUID);
    const tradesRef = db.collection("trades");
    const chatID = [userUID, subjectUID].sort().join("-");
    const chatRef = db.collection("chats").doc(chatID);

    if (tradeType === "buy") {
      // For buy trades, updates user's key amount and subject's holder count,
      // and ensures chat document exists.

      const userKeysRef = userRef.collection("keys").doc(subjectUID);
      const userKeysDoc = await userKeysRef.get();

      const numberAmount = Number(amount);
      if (userKeysDoc.exists) {
        await userKeysRef.update({
          amount: admin.firestore.FieldValue.increment(numberAmount),
        });
      } else {
        await userKeysRef.set({ amount: numberAmount });
      }

      await subjectRef.update({
        holders: admin.firestore.FieldValue.increment(numberAmount),
      });

      const chatDoc = await chatRef.get();
      if (!chatDoc.exists) {
        await chatRef.set({
          participants: [userUID, subjectUID],
          messages: [],
          lastUpdate: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      await tradesRef.add({
        type: "buy",
        user: userUID,
        subject: subjectUID,
        trader: userUID,
        amount,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        txHash,
      });
    } else if (tradeType === "sell") {
      // Retrieves the subject's Ethereum address and checks the
      // user's key balance before proceeding with sell logic.

      const subjectDoc = await subjectRef.get();
      const subjectKey = subjectDoc.data()?.ethereumAddress;

      const usersKeysCContract = new ethers.Contract(
        usersKeysAddress,
        contractAbi,
        provider
      );
      const userKeyCount = await usersKeysCContract.keysBalance(
        subjectKey,
        ethereumAddress
      );

      const invalidAddress =
        !ethereumAddress || !ethers.isAddress(ethereumAddress) ||
        !subjectKey || !ethers.isAddress(subjectKey)

      if (invalidAddress) {
        return NextResponse.json({ message: "Invalid Ethereum address" });
      }

      const userKeysRef = userRef.collection("keys").doc(subjectUID);
      const userKeysDoc = await userKeysRef.get();

      if (userKeysDoc.exists && Number(userKeyCount) === amount) {
        // If the document exists and the user sold all the keys, delete the document.
        await userKeysRef.delete();

        // Decrement holders
        // (pending) Verify if broke when zero/one holders
        await subjectRef.update({
          holders: admin.firestore.FieldValue.increment(-1),
        });
      } else if (userKeysDoc.exists) {
        // If the document exists, decrement the amount.
        const numberAmount = Number(amount);
        await userKeysRef.update({
          amount: admin.firestore.FieldValue.increment(-numberAmount),
        });
      } else {
        // If the document doesn't exist, set the initial amount.
        await userKeysRef.set({
          amount: Number(userKeyCount) - amount,
        });
      }
    }

    return NextResponse.json({
      message: "Trade processed",
      txHash,
      ok: true,
    });
  } catch (error) {
    console.error("Error txn:", error);
    return NextResponse.json({
      message: "Internal Server Error",
      error: error,
    });
  }
}
