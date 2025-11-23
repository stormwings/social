/**
 * Chat Service
 * 
 * Handles all chat-related Firebase operations.
 * Used by chatHooks for managing chats and messages.
 */

import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cutString } from "@/lib/utils";
import { logger } from "@/lib/logger";

/**
 * Interface for chat data
 */
export interface ChatData {
  id: string;
  lastUpdate?: any;
  lastMessage?: string;
  messages?: string[];
  participants: string[];
}

/**
 * Interface for message data
 */
export interface MessageData {
  id?: string;
  text: string;
  sender: string;
  timestamp: any;
  readed: boolean;
  readedTimestamp: any;
}

/**
 * Get all chats for a user
 * 
 * @param uid - User ID
 * @returns Array of chats sorted by last update
 */
export async function getUserChats(uid: string): Promise<ChatData[]> {
  try {
    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", uid)
    );
    const querySnapshot = await getDocs(chatsQuery);

    const chats = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        lastUpdate: data.lastUpdate ? data.lastUpdate.toDate() : null,
      } as ChatData;
    });

    // Sort by last update
    return chats.sort((a, b) => {
      const aTime = a.lastUpdate || 0;
      const bTime = b.lastUpdate || 0;
      return (bTime as any) - (aTime as any);
    });
  } catch (error) {
    logger.error("Failed to get user chats", error, { uid });
    throw error;
  }
}

/**
 * Get chat data by ID
 * 
 * @param chatId - Chat ID
 * @returns Chat data or null if not found
 */
export async function getChatById(chatId: string): Promise<ChatData | null> {
  try {
    const chatRef = doc(db, "chats", chatId);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return null;
    }

    const data = chatDoc.data();
    return {
      id: chatDoc.id,
      ...data,
      lastUpdate: data.lastUpdate ? data.lastUpdate.toDate() : null,
    } as ChatData;
  } catch (error) {
    logger.error("Failed to get chat by ID", error, { chatId });
    throw error;
  }
}

/**
 * Get the other participant in a chat
 * 
 * @param chatId - Chat ID
 * @param currentUserUid - Current user's UID
 * @returns Participant user data or null
 */
export async function getChatParticipant(
  chatId: string,
  currentUserUid: string
): Promise<{ username: string; address: string } | null> {
  try {
    const chatData = await getChatById(chatId);

    if (!chatData) {
      return null;
    }

    const otherParticipant = chatData.participants.find(
      (participant) => participant !== currentUserUid
    );

    if (!otherParticipant) {
      return null;
    }

    const userRef = doc(db, "users", otherParticipant);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();
    return {
      username: userData.username,
      address: userData.ethereumAddress,
    };
  } catch (error) {
    logger.error("Failed to get chat participant", error, { chatId, currentUserUid });
    throw error;
  }
}

/**
 * Send a message in a chat
 * 
 * @param chatId - Chat ID
 * @param senderUid - Sender's UID
 * @param text - Message text
 * @returns Created message ID
 */
export async function sendMessage(
  chatId: string,
  senderUid: string,
  text: string
): Promise<string> {
  try {
    const messagesRef = collection(db, "chats", chatId, "messages");
    const chatRef = doc(db, "chats", chatId);

    // Add message
    const messageDoc = await addDoc(messagesRef, {
      text,
      sender: senderUid,
      timestamp: serverTimestamp(),
      readed: false,
      readedTimestamp: null,
    });

    // Update chat with last message info
    await updateDoc(chatRef, {
      lastUpdate: serverTimestamp(),
      lastMessage: cutString(text, 15),
    });

    logger.debug("Message sent successfully", { chatId, messageId: messageDoc.id });
    return messageDoc.id;
  } catch (error) {
    logger.error("Failed to send message", error, { chatId, senderUid });
    throw error;
  }
}

/**
 * Chat Service API
 */
export const chatService = {
  getUserChats,
  getChatById,
  getChatParticipant,
  sendMessage,
};
