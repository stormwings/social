/**
 * Comments Service
 * 
 * Handles all comment-related Firebase operations.
 * Used by useComments hook for managing post comments.
 */

import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Interface for comment data
 */
export interface Comment {
  commentId?: string;
  postId: string;
  userId: string;
  userAddress: string;
  text: string;
  timestamp: any;
}

/**
 * Get all comments for a post
 * 
 * @param postId - Post ID
 * @returns Array of comments sorted by timestamp
 */
export async function getCommentsByPostId(postId: string): Promise<Comment[]> {
  const commentsQuery = query(
    collection(db, "comments"),
    where("postId", "==", postId),
    orderBy("timestamp", "asc")
  );
  const querySnapshot = await getDocs(commentsQuery);

  return querySnapshot.docs.map((doc) => ({
    ...doc.data(),
    commentId: doc.id,
  })) as Comment[];
}

/**
 * Add a comment to a post
 * 
 * @param comment - Comment data (without commentId and timestamp)
 * @returns Created comment ID
 */
export async function addComment(
  comment: Omit<Comment, "commentId" | "timestamp">
): Promise<string> {
  const newComment = {
    ...comment,
    timestamp: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "comments"), newComment);
  return docRef.id;
}

/**
 * Comments Service API
 */
export const commentsService = {
  getCommentsByPostId,
  addComment,
};
