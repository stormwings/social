import admin from '@/lib/firebase-admin';

/**
 * Firestore database instance
 */
export function getFirestore() {
  return admin.firestore();
}

/**
 * Retrieves wallet data for a user
 * @param uid - User ID
 * @returns Wallet data or null if not found
 */
export async function getUserWallet(uid: string) {
  const db = getFirestore();
  const walletRef = db.collection('wallets').doc(uid);
  const walletDoc = await walletRef.get();

  if (!walletDoc.exists) {
    return null;
  }

  return walletDoc.data();
}

/**
 * Retrieves user data
 * @param uid - User ID
 * @returns User data or null if not found
 */
export async function getUser(uid: string) {
  const db = getFirestore();
  const userRef = db.collection('users').doc(uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    return null;
  }

  return userDoc.data();
}

/**
 * Retrieves the Ethereum address for a user
 * @param uid - User ID
 * @returns Ethereum address or null if not found
 */
export async function getUserEthereumAddress(uid: string): Promise<string | null> {
  const db = getFirestore();
  const walletRef = db.collection('wallets').doc(uid);
  const userRef = db.collection('users').doc(uid);

  const [walletDoc, userDoc] = await Promise.all([walletRef.get(), userRef.get()]);

  if (!userDoc.exists) {
    return null;
  }

  const userData = userDoc.data();
  const walletData = walletDoc.data();

  return walletData?.ethereumAddress ?? userData?.ethereumAddress ?? null;
}
