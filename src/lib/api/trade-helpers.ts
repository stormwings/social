import { ethers } from 'ethers';
import admin from '@/lib/firebase-admin';
import { GAS_PRICE, PRIVATE_KEY, RPC_ENDPOINT } from '@/lib/dappParams';

const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT);

/**
 * Ensures user has sufficient ETH balance for gas fees
 * @param ethereumAddress - User's Ethereum address
 * @returns Transaction hash if ETH was sent, null otherwise
 */
export async function ensureSufficientGas(
  ethereumAddress: string
): Promise<string | null> {
  const userEthBalance = await provider.getBalance(ethereumAddress);

  if (Number(ethers.formatEther(userEthBalance)) < 1) {
    console.log('User LAC balance too low ' + ethereumAddress);

    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const tx = {
      to: ethereumAddress,
      value: ethers.parseEther('5'),
      gasLimit: 21000,
      gasPrice: GAS_PRICE,
    };

    const response = await wallet.sendTransaction(tx);
    console.log(`Transaction hash: ${response.hash}`);

    const receipt = await response.wait();
    if (receipt) {
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    }

    return response.hash;
  }

  return null;
}

/**
 * Updates user's key holdings in Firestore
 * @param userRef - User document reference
 * @param subjectUID - Subject user ID
 * @param amount - Amount of keys
 * @param isIncrement - Whether to increment (true) or decrement (false)
 */
export async function updateUserKeys(
  userRef: FirebaseFirestore.DocumentReference,
  subjectUID: string,
  amount: number,
  isIncrement: boolean = true
): Promise<void> {
  const userKeysRef = userRef.collection('keys').doc(subjectUID);
  const userKeysDoc = await userKeysRef.get();
  const numberAmount = Number(amount);

  if (userKeysDoc.exists) {
    await userKeysRef.update({
      amount: admin.firestore.FieldValue.increment(
        isIncrement ? numberAmount : -numberAmount
      ),
    });
  } else {
    await userKeysRef.set({ amount: numberAmount });
  }
}

/**
 * Creates a chat document if it doesn't exist
 * @param db - Firestore instance
 * @param uid - User ID
 * @param subjectUID - Subject user ID
 */
export async function ensureChatExists(
  db: FirebaseFirestore.Firestore,
  uid: string,
  subjectUID: string
): Promise<void> {
  const chatID = [uid, subjectUID].sort().join('-');
  const chatRef = db.collection('chats').doc(chatID);
  const chatDoc = await chatRef.get();

  if (!chatDoc.exists) {
    await chatRef.set({
      participants: [uid, subjectUID],
      messages: [],
      lastUpdate: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('Chat document created for', uid, 'and', subjectUID);
  }
}

/**
 * Records a trade in Firestore
 * @param db - Firestore instance
 * @param tradeType - 'buy' or 'sell'
 * @param uid - User ID
 * @param subjectUID - Subject user ID
 * @param amount - Amount of keys
 * @param txHash - Transaction hash
 */
export async function recordTrade(
  db: FirebaseFirestore.Firestore,
  tradeType: 'buy' | 'sell',
  uid: string,
  subjectUID: string,
  amount: number,
  txHash: string
): Promise<void> {
  const tradesRef = db.collection('trades');
  const tradeRecord = {
    type: tradeType,
    user: uid,
    subject: subjectUID,
    trader: uid,
    amount,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    txHash,
  };
  await tradesRef.add(tradeRecord);
}
