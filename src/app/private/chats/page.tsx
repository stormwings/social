"use client";

import Link from "next/link";
import { useUserData, useUserChats } from "@/lib/hooks";
import ChatListItem from "@/components/ChatListItem";
import TopbarMedia from "@/components/TopbarMedia";

export default function UserChats() {
    const { user } = useUserData();
    const userChats = useUserChats(user);

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
                    <div className="flex flex-col">
                        <ul className="divide-y divide-gray-200 overflow-auto">
                            {userChats.map((chat) => (
                                <ChatListItem key={chat.id} chatId={chat.id} />
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
