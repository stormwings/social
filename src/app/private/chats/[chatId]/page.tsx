"use client";

import { useUserData, useChatMessages, useChatParticipant, useSendMessage } from "@/lib/hooks";

import TopbarMedia from "@/components/TopbarMedia";
import ProfilePicture from "@/components/ProfilePicture";

import { convertTimestampToDate } from "@/lib/utils";

export default function ChatRoom({ params }: { params: { chatId: string } }) {
  const chatId = params.chatId;
  const { user, ethereumAddress } = useUserData();
  const messages = useChatMessages(chatId);
  const { username: otherParticipantUsername, address: otherParticipantAddress } = useChatParticipant(chatId, user);
  const { newMessage, setNewMessage, sendMessage } = useSendMessage(chatId, user);

  const MyPicture = user && ethereumAddress ? <ProfilePicture userAddress={ethereumAddress} /> : <></>;
  const ReceptorPicture =
    otherParticipantUsername && otherParticipantAddress ? <ProfilePicture userAddress={otherParticipantAddress} /> : <></>;

  return (
    <div className="min-h-screen">
      <TopbarMedia title={`Chat ${otherParticipantUsername}`} showBack />

      <div className="max-w-sm mx-auto mt-6 flex flex-col">
        <div className="chat-messages space-y-4">
          {messages.map((message) => {
            const isSender = message.sender === user?.uid;

            return isSender ? (
              <div key={message.id} className="flex items-end justify-end mb-4">
                <div className="bg-[#FF4D24] rounded-lg rounded-tr-none max-w-xs px-4 py-2">
                  <p className="text-white">{message.text}</p>
                  <p className="text-white text-xs mt-1">
                    {convertTimestampToDate(message?.timestamp?.seconds)}
                  </p>
                </div>
                <div className="flex items-center justify-center rounded-lg ml-3">{MyPicture}</div>
              </div>
            ) : (
              <div key={message.id} className="flex items-center mb-4">
                <div className="mr-3 w-12 h-12 rounded-full overflow-hidden">{ReceptorPicture}</div>
                <div className="bg-[#FEF1F4] rounded-lg rounded-tl-none max-w-xs px-4 py-2">
                  <p className="text-black">{message.text}</p>
                  <p className="text-gray-400 text-xs mt-1">{convertTimestampToDate(message?.timestamp?.seconds)}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="chat-input mt-8">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write your message here..."
            rows={4}
            className="w-full p-2 rounded border"
          ></textarea>
          <button onClick={sendMessage} className="mt-2 bg-[#FF4D24] text-white py-2 px-4 rounded">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
