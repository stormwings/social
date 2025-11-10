import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  serverTimestamp,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cutString } from "@/lib/utils";

interface ChatData {
  id: string;
  lastUpdate?: any;
  messages: string[];
  participants: string[];
}

export function useUserChats(user: any) {
  const [userChats, setUserChats] = useState<ChatData[]>([]);

  useEffect(() => {
    async function fetchUserChats() {
      if (!user) return;

      const chatsQuery = query(
        collection(db, "chats"),
        where("participants", "array-contains", user.uid)
      );
      const querySnapshot = await getDocs(chatsQuery);

      const fetchedChats = querySnapshot.docs.map(transDocToObj);
      const sortedChats = sortChatsByLastUpdate(fetchedChats);

      setUserChats(sortedChats);
    }

    fetchUserChats();
  }, [user]);

  const transDocToObj = (doc: QueryDocumentSnapshot): ChatData => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      lastUpdate: data.lastUpdate ? data.lastUpdate.toDate() : null,
    } as ChatData;
  };

  const sortChatsByLastUpdate = (chats: ChatData[]): ChatData[] =>
    chats.sort((a, b) => (b.lastUpdate || 0) - (a.lastUpdate || 0));

  return userChats;
}

export function useChatMessages(chatId: string) {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (chatId) {
      const messagesRef = collection(db, "chats", chatId, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      });

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

      const chatRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) return;

      const otherParticipant = chatDoc
        .data()
        .participants.find((participant: string) => participant !== user.uid);

      if (otherParticipant) {
        const userRef = doc(db, "users", otherParticipant);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setParticipant({
            username: userDoc.data().username,
            address: userDoc.data().ethereumAddress,
          });
        }
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
      const messagesRef = collection(db, "chats", chatId, "messages");
      const chatRef = doc(db, "chats", chatId);

      await addDoc(messagesRef, {
        text: newMessage,
        sender: user.uid,
        timestamp: serverTimestamp(),
        readed: false,
        readedTimestamp: null,
      });

      updateDoc(chatRef, {
        lastUpdate: serverTimestamp(),
        lastMessage: cutString(newMessage, 15),
      });

      setNewMessage("");
    }
  };

  return { newMessage, setNewMessage, sendMessage };
}
