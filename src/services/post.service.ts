/**
 * Post Service
 * 
 * Handles all post-related Firebase operations and API calls.
 * Used by postHooks for managing posts, hearts, and post creation.
 */

import {
  collection,
  collectionGroup,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  increment,
  serverTimestamp,
  DocumentData,
  DocumentReference,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ENDPOINTS } from "@/lib/apiEndpoints";

/**
 * Interface for post data
 */
export interface Post {
  id?: string;
  postId?: string;
  username: string;
  uid: string;
  published: boolean;
  content: string;
  createdAt: any;
  updatedAt: any;
  heartCount: number;
  images?: string[];
  [key: string]: any;
}

/**
 * Interface for creating a new post
 */
export interface CreatePostData {
  username: string;
  uid: string;
  content: string;
  images?: string[];
}

/**
 * Get posts by user keys (for feed)
 * 
 * @param userKeys - Array of user UIDs
 * @returns Array of posts
 */
export async function getKeyedPosts(userKeys: string[]): Promise<Post[]> {
  if (userKeys.length === 0) {
    return [];
  }

  const limitedUserKeys = userKeys.slice(0, 10);
  const postsRef = collectionGroup(db, "posts");
  const q = query(
    postsRef,
    where("uid", "in", limitedUserKeys),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    postId: doc.id,
    ...doc.data(),
  })) as Post[];
}

/**
 * Create a new post
 * 
 * @param uid - User ID
 * @param postData - Post data
 * @returns Created post ID
 */
export async function createPost(
  uid: string,
  postData: CreatePostData
): Promise<string> {
  const ref = doc(collection(db, `users/${uid}/posts`));

  const post: Post = {
    username: postData.username,
    uid: postData.uid,
    published: true,
    content: postData.content,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    heartCount: 0,
    images: postData.images || [],
  };

  await setDoc(ref, post);
  return ref.id;
}

/**
 * Toggle heart on a post
 * 
 * @param postRef - Post document reference
 * @param userUid - User's UID
 * @param hasHeart - Whether user already has heart on this post
 */
export async function toggleHeart(
  postRef: DocumentReference,
  userUid: string,
  hasHeart: boolean
): Promise<void> {
  const batch = writeBatch(db);
  const heartRef = doc(postRef, "hearts", userUid);

  batch.update(postRef, { heartCount: increment(hasHeart ? -1 : 1) });

  if (hasHeart) {
    batch.delete(heartRef);
  } else {
    batch.set(heartRef, { uid: userUid });
  }

  await batch.commit();
}

/**
 * Mint post as NFT (currently not implemented)
 * This is a placeholder for future NFT functionality
 * 
 * @param params - Mint parameters
 */
export const handleMintPost = async ({
  // user,
  // userUID,
  // postId,
  // ethereumAddress,
}: any) => {
  // TODO: Implement NFT minting when ready
  // const token = await user.getIdToken();
  // const headers = {
  //   "Content-Type": "application/json",
  //   Authorization: `Bearer ${token}`,
  // };
  // const signer = await getSigner();
  // const postContract = new ethers.Contract(
  //   socialPostAddress,
  //   SocialPostAbi.abi,
  //   signer
  // );
  // const transaction = await postContract.createPost();
  // toast.success(
  //   `Operation completed successfully. Txn hash: ${transaction.hash}`
  // );
  // const receipt = await transaction.wait();
  // const postCreatedEvent = receipt.events?.find(
  //   (e: any) => e.event === "PostCreated"
  // );
  // await fetch(ENDPOINTS.MINT_POST_NFT, {
  //   method: 'POST',
  //   headers: headers,
  //   body: JSON.stringify({
  //     userUID: userUID,
  //     postId: postId,
  //     tokenId: postCreatedEvent?.args?.postId.toString(),
  //     ethereumAddress: ethereumAddress,
  //   }),
  // });
};

/**
 * Post Service API
 */
export const postService = {
  getKeyedPosts,
  createPost,
  toggleHeart,
  handleMintPost,
};
