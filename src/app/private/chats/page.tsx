"use client";

import Link from "next/link";
import TopbarMedia from "@/components/TopbarMedia";
import ProfilePicture from "@/components/smart/ProfilePicture";

import { useUserData, useUserChats, useUserProfileByUid } from "@/lib/hooks";
import { timeSince } from "src/lib/utils";

type ChatSummary = {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastUpdate?: Date | null;
};

type ChatListItemProps = {
  chat: ChatSummary;
  currentUid: string | null | undefined;
};

function ChatListItem({ chat, currentUid }: ChatListItemProps) {
  const otherUid = chat.participants.find((p) => p !== currentUid) ?? null;

  const { userProfile } = useUserProfileByUid(otherUid || "");
  if (!otherUid || !userProfile) return null;

  const lastMsg = chat.lastMessage || "No messages yet.";
  const lastUpdateSecs = chat.lastUpdate
    ? Math.floor(chat.lastUpdate.getTime() / 1000)
    : null;

  return (
    <Link href={`/private/chats/${chat.id}`}>
      <li
        className="flex justify-between items-center px-4 py-3 bg-white hover:bg-gray-50 cursor-pointer"
        data-testid={`chat-item-${chat.id}`}
      >
        <div className="flex items-center space-x-3">
          <div
            className="w-12 h-12 rounded-full"
            data-testid="profile-picture-container"
          >
            <ProfilePicture userAddress={userProfile.ethereumAddress} />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold" data-testid="chat-username">
              {userProfile.username}
            </span>
            <span className="text-gray-500" data-testid="chat-last-message">
              {lastMsg} {lastUpdateSecs ? `· ${timeSince(lastUpdateSecs)}` : ""}
            </span>
          </div>
        </div>
      </li>
    </Link>
  );
}

export default function UserChats() {
  const { user } = useUserData();
  const userChats = useUserChats(user) as ChatSummary[];

  return (
    <div className="min-h-screen">
      <TopbarMedia title="Chats" showBack />
      <div className="max-w-sm mx-auto">
        {userChats.length === 0 ? (
          <div className="text-center space-y-2 pt-16">
            <p className="text-lg">You have no conversations at the moment.</p>
            <hr className="my-4" />
            <p className="text-gray-400 hover:underline">
              <Link href="/private/explorer">Explore</Link>
            </p>
          </div>
        ) : (
          <div className="flex flex-col mt-4">
            <ul className="divide-y divide-gray-200 overflow-auto">
              {userChats.map((chat) => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  currentUid={user?.uid}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
