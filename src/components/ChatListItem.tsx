import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";

import { useUserData, useChatParticipant } from "@/lib/hooks";
import ProfilePicture from "./ProfilePicture";
import { timeSince } from "src/lib/utils";

interface IChatListItemProps {
  chatId: string;
}

const ChatListItem = ({ chatId }: IChatListItemProps) => {
  const { user } = useUserData();
  const {
    username: otherParticipantUsername,
    address: otherParticipantAddress,
  } = useChatParticipant(chatId, user);

  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);

  useEffect(() => {
    const fetchChatData = async () => {
      if (!chatId) return;
      const chatRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatRef);
      if (chatDoc.exists()) {
        setLastMessage(chatDoc.data().lastMessage || "No messages yet.");
        setLastUpdate(chatDoc.data().lastUpdate?.seconds || null);
      }
    };
    fetchChatData();
  }, [chatId]);

  if (!otherParticipantUsername || !otherParticipantAddress) return null;

  return (
    <Link href={`/private/chats/${chatId}`} passHref>
      <li
        className="flex justify-between items-center px-4 py-3 bg-white hover:bg-gray-50 cursor-pointer"
        data-testid={`chat-item-${chatId}`}
      >
        <div className="flex items-center space-x-3">
          <div
            className="w-12 h-12 rounded-full"
            data-testid="profile-picture-container"
          >
            <ProfilePicture userAddress={otherParticipantAddress} />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold" data-testid="chat-username">
              {otherParticipantUsername || "..."}
            </span>
            <span className="text-gray-500" data-testid="chat-last-message">
              {lastMessage} {lastUpdate ? `· ${timeSince(lastUpdate)}` : ""}
            </span>
          </div>
        </div>
      </li>
    </Link>
  );
};

export default ChatListItem;
