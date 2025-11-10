/**
 * User Service
 * 
 * Handles all user-related Firebase operations.
 * Used by userHooks for managing user data, profiles, and posts.
 */

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { logger } from "@/lib/logger";

/**
 * Interface for user profile data
 */
export interface UserProfile {
  id?: string;
  username: string;
  ethereumAddress: string;
  displayName?: string;
  photoURL?: string;
  holders?: number;
  createdAt?: any;
  [key: string]: any;
}

/**
 * Get user data by UID
 * 
 * @param uid - User ID
 * @returns User data or null if not found
 */
export async function getUserByUid(uid: string): Promise<DocumentData | null> {
  try {
    const userDocRef = doc(db, "users", uid);
    const userSnapshot = await getDoc(userDocRef);
    return userSnapshot.exists() ? userSnapshot.data() : null;
  } catch (error) {
    logger.error("Failed to get user by UID", error, { uid });
    throw error;
  }
}

/**
 * Get user profile by username
 * 
 * @param username - Username to search for
 * @returns User profile with UID or null if not found
 */
export async function getUserByUsername(
  username: string
): Promise<{ uid: string; profile: DocumentData } | null> {
  try {
    const usersRef = query(
      collection(db, "users"),
      where("username", "==", username)
    );
    const userSnapshot = await getDocs(usersRef);

    if (userSnapshot.empty) {
      return null;
    }

    const doc = userSnapshot.docs[0];
    return {
      uid: doc.id,
      profile: doc.data(),
    };
  } catch (error) {
    logger.error("Failed to get user by username", error, { username });
    throw error;
  }
}

/**
 * Get user profile by Ethereum address
 * 
 * @param address - Ethereum address
 * @returns User profile with UID or null if not found
 */
export async function getUserByAddress(
  address: string
): Promise<{ uid: string; profile: DocumentData } | null> {
  try {
    const usersRef = query(
      collection(db, "users"),
      where("ethereumAddress", "==", address)
    );
    const snapshot = await getDocs(usersRef);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      uid: doc.id,
      profile: doc.data(),
    };
  } catch (error) {
    logger.error("Failed to get user by address", error, { address });
    throw error;
  }
}

/**
 * Get user posts by UID
 * 
 * @param uid - User ID
 * @returns Array of posts
 */
export async function getUserPosts(uid: string): Promise<DocumentData[]> {
  try {
    const postsRef = collection(db, "users", uid, "posts");
    const q = query(postsRef, orderBy("createdAt"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      postId: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    logger.error("Failed to get user posts", error, { uid });
    throw error;
  }
}

/**
 * Get user keys (trading keys owned by user)
 * 
 * @param uid - User ID
 * @returns Array of key UIDs
 */
export async function getUserKeys(uid: string): Promise<string[]> {
  try {
    const keysRef = collection(db, "users", uid, "keys");
    const querySnapshot = await getDocs(keysRef);
    return querySnapshot.docs.map((doc) => doc.id);
  } catch (error) {
    logger.error("Failed to get user keys", error, { uid });
    throw error;
  }
}

/**
 * Get all users with optional sorting
 * 
 * @param sortBy - Field to sort by ('createdAt' or 'holders')
 * @param sortOrder - Sort order ('asc' or 'desc')
 * @param maxResults - Maximum number of results (default: 100)
 * @returns Array of users
 */
export async function getUsers(
  sortBy: "createdAt" | "holders" = "createdAt",
  sortOrder: "asc" | "desc" = "desc",
  maxResults: number = 100
): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy(sortBy, sortOrder), limit(maxResults));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as UserProfile[];
  } catch (error) {
    logger.error("Failed to get users", error, { sortBy, sortOrder, maxResults });
    throw error;
  }
}

/**
 * Update user photo URL
 * 
 * @param uid - User ID
 * @param photoURL - New photo URL
 */
export async function updateUserPhoto(
  uid: string,
  photoURL: string
): Promise<void> {
  try {
    await updateDoc(doc(db, "users", uid), { photoURL });
  } catch (error) {
    logger.error("Failed to update user photo", error, { uid, photoURL });
    throw error;
  }
}

/**
 * Check if username exists
 * 
 * @param username - Username to check
 * @returns True if username exists, false otherwise
 */
export async function usernameExists(username: string): Promise<boolean> {
  try {
    const ref = doc(db, `usernames/${username}`);
    const docSnap = await getDoc(ref);
    return docSnap.exists();
  } catch (error) {
    logger.error("Failed to check username existence", error, { username });
    throw error;
  }
}

/**
 * User Service API
 */
export const userService = {
  getUserByUid,
  getUserByUsername,
  getUserByAddress,
  getUserPosts,
  getUserKeys,
  getUsers,
  updateUserPhoto,
  usernameExists,
};
