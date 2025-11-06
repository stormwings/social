export const maxDuration = 60;

import { NextResponse } from 'next/server';
import { headers } from 'next/headers'

import admin from '@/lib/firebase-admin'; // Import the Firebase admin SDK

import { RPC_ENDPOINT, usdtAddress, usersKeysAddress, GAS_PRICE, PRIVATE_KEY } from '@/lib/dappParams';
import contractAbi from '../../../usersKeysAbi';
import usdtTokenAbi from '../../../usdtTokenAbi';

import { ethers } from 'ethers';
const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT);

import crypto from 'crypto';

export async function POST(request: Request) {
    console.log("POST /api/trade");
    const trade  = await request.json();
    console.log("trade", trade);

    const tradeType = trade['type'];
    const subjectUID = trade['subjectUID'];
    const amount = trade['amount'];

    // Get the Authorization header
    // console.log("request.headers", request.headers);
    // const authHeader = request.headers['Authorization'] || request.headers['authorization'];
    const headersList = headers()
    const authHeader = headersList.get('Authorization')
   
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ message: "Not authenticated", error: 101 });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        // Verify the token
        const decodedToken = await admin.auth().verifyIdToken(token);
        if (!decodedToken) {
            return NextResponse.json({ message: "Not authenticated", error: 101 });
        }

        const uid = decodedToken.uid;
        console.log("uid", uid);

        const db = admin.firestore();
        const walletRef = db.collection('wallets').doc(uid);
        const walletDoc = await walletRef.get();

        if (!walletDoc.exists) {
            return NextResponse.json({ message: "User not found", error: 102 });
        }

        const walletData = walletDoc.data();
        if (!walletData) {
            return NextResponse.json({ message: "User not found", error: 102 });
        }
        const ethereumAddress = walletData.ethereumAddress;


        // Decrypt the private key before using it
        let ethereumPrivateKey;
        const [iv, authTag, encryptedText] = walletData.encryptedPrivateKey.split(':');
        const decipher = crypto.createDecipheriv(
            'aes-256-gcm',
            Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'),
            Buffer.from(iv, 'hex')
        );
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));

        try {
            ethereumPrivateKey = decipher.update(encryptedText, 'hex', 'utf8') + decipher.final('utf8');
        } catch (error) {
            console.error('Decryption failed:', error);
            return NextResponse.json({ message: 'Internal Server Error', error: 500 }, { status: 500 });
        }
        console.log('wallet decrypted')

        const userRef = db.collection('users').doc(uid);
        const tradesRef = db.collection('trades');
        console.log("subjectUID", subjectUID);
        const subjectRef = db.collection('users').doc(subjectUID);
        const subjectDoc = await subjectRef.get();
        if (!subjectDoc.exists) {
            return NextResponse.json({ message: "Subject not found", error: 102 });
        }
        const subjectKey = subjectDoc.data()?.ethereumAddress;
        console.log("subjectKey", subjectKey);
        const userEthBalance = await provider.getBalance(ethereumAddress);
        if (Number(ethers.formatEther(userEthBalance)) < 1) {
                console.log("User LAC balance too low " + ethereumAddress);

                const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
                // Create and sign the transaction
                let tx = {
                    to: ethereumAddress,
                    value: ethers.parseEther("5"),
                    gasLimit: 21000,
                    gasPrice: GAS_PRICE
                };

                let response = await wallet.sendTransaction(tx);
                console.log(`Transaction hash: ${response.hash}`);
                let receipt = await response.wait();
                if (receipt) {
                console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
                }
                //return NextResponse.json({ message: "Insufficient LAC balance", error: 103 });
        }

        if (tradeType === "buy") {
            const usdtContract = new ethers.Contract(usdtAddress, usdtTokenAbi, provider);
            const userUsdtBalance = await usdtContract.balanceOf(ethereumAddress);

            const usersKeysCContract = new ethers.Contract(usersKeysAddress, contractAbi, provider);
            const usdtPriceForKeys = await usersKeysCContract.getBuyPrice(subjectKey, amount);
            console.log("usdtPriceForKeys", ethers.formatEther(usdtPriceForKeys));

            if (userUsdtBalance < usdtPriceForKeys) {
                console.log("User USDT balance too low " + ethereumAddress + " " + ethers.formatEther(userUsdtBalance) + " < " + ethers.formatEther(usdtPriceForKeys));
                return NextResponse.json({ message: "Insufficient USDT balance" });
            }

            const currentAllowance = await usdtContract.allowance(ethereumAddress, usersKeysAddress);
            if (currentAllowance < usdtPriceForKeys) {
                // Approve the UsersKeys contract to spend on behalf of the user
                console.log("Approving USDT spend for UsersKeys contract");
                const connectedUsdtContract = usdtContract.connect(new ethers.Wallet(ethereumPrivateKey, provider));                
                const approveTx = await (connectedUsdtContract as any).approve(usersKeysAddress, usdtPriceForKeys * BigInt(10));
                await approveTx.wait();
            }

            console.log("Buying keys", subjectKey, amount);
            const tx = await (usersKeysCContract as any).connect(new ethers.Wallet(ethereumPrivateKey, provider)).buyKeys(subjectKey, amount);
            await tx.wait();

            // Update the number of keys the user bought for the given subject
            try {
                const userKeysRef = userRef.collection('keys').doc(subjectUID); // Create a sub-collection 'keys' under the user's document.
                const userKeysDoc = await userKeysRef.get();
                
                if (userKeysDoc.exists) {
                    // If the document exists, increment the amount.
                    console.log(typeof amount, amount);
                    const numberAmount = Number(amount);
                    await userKeysRef.update({
                        amount: admin.firestore.FieldValue.increment(numberAmount)
                    });
                } else {
                    // If the document doesn't exist, set the initial amount.
                    await userKeysRef.set({
                        amount: amount
                    });
                }
                // increment the amount of holders
                await subjectRef.update({
                    holders: admin.firestore.FieldValue.increment(Number(amount)),
                });
            } catch (dbError) {
                console.error("Error updating the keys in Firestore:", dbError);
                return NextResponse.json({ message: "Internal Server Error" });
            }

            console.log("Trade processed", tx.hash);

            // Create chat document if it doesn't exist
            const chatID = [uid, subjectUID].sort().join('-');  // create a consistent chatID
            const chatRef = db.collection('chats').doc(chatID);
            const chatDoc = await chatRef.get();

            if (!chatDoc.exists) {
                // Create the initial chat document
                await chatRef.set({
                    participants: [uid, subjectUID],
                    messages: [],
                    lastUpdate: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log("Chat document created for", uid, "and", subjectUID);
            }

            // After successfully processing the buy trade
            const tradeRecord = {
                type: tradeType,
                user: uid,
                subject: subjectUID,
                trader: uid,
                amount,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                txHash: tx.hash
            };
            await tradesRef.add(tradeRecord);
            
            return NextResponse.json({ message: "Trade processed", txHash: tx.hash });
        } else if (tradeType === "sell") {
            const usersKeysCContract = new ethers.Contract(usersKeysAddress, contractAbi, provider);

            const userKeyCount = await usersKeysCContract.keysBalance(subjectKey, ethereumAddress);
        
            if (userKeyCount < amount) {
                return NextResponse.json({ message: "Insufficient keys to sell" });
            }
                
            console.log("Selling keys", subjectKey, amount);
            const tx = await (usersKeysCContract as any).connect(new ethers.Wallet(ethereumPrivateKey, provider)).sellKeys(subjectKey, amount);
            await tx.wait();
        
            // Update the number of keys the user bought for the given subject
            try {
                const userKeysRef = userRef.collection('keys').doc(subjectUID); // Create a sub-collection 'keys' under the user's document.
                const userKeysDoc = await userKeysRef.get();
                
                if (userKeysDoc.exists && userKeyCount === amount) {
                    // If the document exists and the user sold all the keys, delete the document.
                    await userKeysRef.delete();
                } else if (userKeysDoc.exists) {
                    // If the document exists, decrement the amount.
                    const numberAmount = Number(amount);
                    await userKeysRef.update({
                        amount: admin.firestore.FieldValue.increment(-numberAmount)
                    });
                } else {
                    // If the document doesn't exist, set the initial amount.
                    await userKeysRef.set({
                        amount: (userKeyCount - amount)
                    });
                }
                // decrement the amount of holders
                await subjectRef.update({
                    holders: admin.firestore.FieldValue.increment(-Number(amount)),
                });
            } catch (dbError) {
                console.error("Error updating the keys in Firestore:", dbError);
                return NextResponse.json({ message: "Internal Server Error" });
            }

            console.log("Sell processed", tx.hash);

            // After successfully processing the sell trade
            const tradeRecord = {
                type: tradeType,
                user: uid,
                subject: subjectUID,
                trader: uid,
                amount,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                txHash: tx.hash
            };
            await tradesRef.add(tradeRecord);
            
            return NextResponse.json({ message: "Sell processed", txHash: tx.hash });
        }

    } catch (error) {
        function isErrorWithCode(error: unknown): error is { code: string } {
            return typeof error === 'object' && error !== null && 'code' in error && typeof (error as any).code === 'string';
        }
        if (isErrorWithCode(error) && error.code === 'auth/id-token-expired') {
            return NextResponse.json({ message: "Token expired" });
        } else {
            console.error("Error processing trade:", error);
            return NextResponse.json({ message: "Internal Server Error" });
        }
    } 
}