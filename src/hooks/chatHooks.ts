import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "@/lib/firebase";
import { chatService, ChatData } from "@/services";
import { logger } from "@/lib/logger";

export function useUserChats(user: any) {
  const [userChats, setUserChats] = useState<ChatData[]>([]);

  useEffect(() => {
    async function fetchUserChats() {
      if (!user) return;

      try {
        const fetchedChats = await chatService.getUserChats(user.uid);
        setUserChats(fetchedChats);
      } catch (error) {
        logger.error("Error fetching user chats", error, { uid: user?.uid });
        toast.error("Failed to load chats");
      }
    }

    fetchUserChats();
  }, [user]);

  return userChats;
}

export function useChatMessages(chatId: string) {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (chatId) {
      const messagesRef = collection(db, "chats", chatId, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          setMessages(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        },
        (error) => {
          logger.error("Error fetching chat messages", error, { chatId });
          toast.error("Failed to load messages");
        }
      );

      return () => unsubscribe();
    }
  }, [chatId]);

  return messages;
}

export function useChatParticipant(chatId: string, user: any) {
  const [participant, setParticipant] = useState<{
    username: string | null;
    address: string | null;
  }>({
    username: null,
    address: null,
  });

  useEffect(() => {
    async function fetchChatData() {
      if (!chatId || !user) return;

      try {
        const participantData = await chatService.getChatParticipant(chatId, user.uid);
        if (participantData) {
          setParticipant({
            username: participantData.username,
            address: participantData.address,
          });
        }
      } catch (error) {
        logger.error("Error fetching chat participant", error, { chatId });
        toast.error("Failed to load chat participant");
      }
    }

    fetchChatData();
  }, [chatId, user]);

  return participant;
}

export function useSendMessage(chatId: string, user: any) {
  const [newMessage, setNewMessage] = useState("");

  const sendMessage = async () => {
    if (newMessage.trim() !== "" && user) {
      try {
        await chatService.sendMessage(chatId, user.uid, newMessage);
        setNewMessage("");
      } catch (error) {
        logger.error("Error sending message", error, { chatId });
        toast.error("Failed to send message");
      }
    }
  };

  return { newMessage, setNewMessage, sendMessage };
}
