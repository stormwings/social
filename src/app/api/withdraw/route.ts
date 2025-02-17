import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import admin from '@/lib/firebase-admin';

import { RPC_ENDPOINT, usdtAddress, GAS_PRICE } from '@/lib/dappParams';
import usdtTokenAbi from '../../../usdtTokenAbi';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT);
import crypto from 'crypto';

export async function POST(request: Request) {
    console.log("POST /api/withdraw");
    const withdrawal = await request.json();
    console.log("withdrawal", withdrawal);
  
    const amount = withdrawal['amount'];
    const withdrawAddress = withdrawal['address'];
  
    const headersList = headers()
    const authHeader = headersList.get('Authorization');
  
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: "Not authenticated", code: 101 });
    }

    const token = authHeader.split('Bearer ')[1];
  
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        if (!decodedToken) {
            return NextResponse.json({ error: "Not authenticated", code: 101 });
        }
  
        const uid = decodedToken.uid;
        console.log("uid", uid);
        
        // Fetch the user’s private key from Firestore
        const db = admin.firestore();
        const walletRef = db.collection('wallets').doc(uid);
        const walletDoc = await walletRef.get();
        
        if (!walletDoc.exists) {
            return NextResponse.json({ error: "User not found", code: 102 });
        }
        
        const walletData = walletDoc.data();
        if (!walletData) {
            return NextResponse.json({ error: "User not found", code: 102 });
        }

        let userPrivateKey;
        if (walletData.encryptedPrivateKey) {
            // Decrypt the private key before using it
            const [iv, authTag, encryptedText] = walletData.encryptedPrivateKey.split(':');
            const decipher = crypto.createDecipheriv(
                'aes-256-gcm',
                Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'),
                Buffer.from(iv, 'hex')
            );
            decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
            try {
                userPrivateKey = decipher.update(encryptedText, 'hex', 'utf8') + decipher.final('utf8');
            } catch (error) {
                console.error('Decryption failed:', error);
                return NextResponse.json({ message: 'Internal Server Error', error: 500 }, { status: 500 });
            }
        } else {
            return NextResponse.json({ message: "wrong data" }, { status: 500});
        }


        // Use user’s private key to create and sign the withdrawal transaction
        const wallet = new ethers.Wallet(userPrivateKey, provider);

        // Interact with the USDT contract to withdraw the specified amount
        const usdtContract = new ethers.Contract(usdtAddress, usdtTokenAbi, provider);
        const connectedUsdtContract = usdtContract.connect(new ethers.Wallet(userPrivateKey, provider));
  
        const amountInWei = ethers.parseUnits(amount.toString(), 'ether'); // Replace 'ether' with the number of decimals if the token is not 18 decimals
        
        const tx = await (connectedUsdtContract as any).transfer(withdrawAddress, amountInWei, { gasPrice: GAS_PRICE });
        const receipt = await tx.wait();
  
        console.log(`Transaction confirmed: ${receipt.hash}`);  
        return NextResponse.json({ message: "Withdrawal processed", txHash: receipt.hash });
  
    } catch (error) {
        console.error("Error processing withdrawal:", error);
        return NextResponse.json({ error: "Internal Server Error", code: 500 });
    }
}
