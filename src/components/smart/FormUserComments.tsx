"use client";

import { useState } from "react";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";

import ProfilePicture from "@/components/smart/ProfilePicture";
import { useUsersData } from "@/lib/hooks";

import { IComment, useComments } from "src/hooks/useComments";
import { convertTimestampToDate } from "src/lib/utils";

interface FormUserCommentsProps {
  postId: string;
  userAddress: string;
  user: { uid: string };
}

export default function FormUserComments({
  postId,
  userAddress,
  user,
}: FormUserCommentsProps) {
  const { comments, sendComment } = useComments(postId, user?.uid);
  const usersData = useUsersData({});

  return (
    <>
      <div className="border-t" data-testid="add-comment-section">
        <AddComment
          userAddress={userAddress}
          onConfirm={sendComment}
          isEmpty={comments?.length === 0}
        />
      </div>
      <div className="border-t" data-testid="comments-list">
        <CommentsList comments={comments} usersData={usersData} />
      </div>
    </>
  );
}

interface AddCommentProps {
  userAddress: string;
  isEmpty: boolean;
  onConfirm: (text: string, userAddress: string) => Promise<void>;
}

const AddComment = ({ userAddress, onConfirm, isEmpty }: AddCommentProps) => {
  const [text, setText] = useState("");

  const handleSubmit = async () => {
    const isValidText = /^.{1,350}$/.test(text);
    const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(userAddress);

    if (isValidText && isValidAddress) {
      await onConfirm(text, userAddress);
      setText("");
    }
  };

  return (
    <div className="p-4 flex items-center space-x-2">
      <div className="w-8 h-8 rounded-full">
        <ProfilePicture userAddress={userAddress} />
      </div>
      <form
        className="flex-grow"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        data-testid="comment-form"
      >
        <div className="flex items-center space-x-2">
          <input
            className="bg-gray-100 rounded-full py-2 px-4 text-sm flex-grow"
            type="text"
            value={text}
            placeholder={
              isEmpty ? "Be the first to comment" : "Add a comment..."
            }
            onChange={(e) => setText(e.target.value)}
            data-testid="comment-input"
          />
          <button type="submit" className="text-gray-500 hover:text-gray-700">
            <ChatBubbleLeftIcon
              className="h-6 w-6"
              data-testid="send-comment-button"
            />
          </button>
        </div>
      </form>
    </div>
  );
};

interface CommentsListProps {
  comments: IComment[];
  usersData: any;
}

const CommentsList = ({ comments, usersData }: CommentsListProps) => {
  if (!comments?.length || !usersData?.length) return null;

  return (
    <>
      {comments.map((comment, i) => {
        const user = usersData.find((u: any) => u.uid === comment.userId);

        return (
          <div
            key={i}
            className="px-4 py-3 flex flex-col space-x-2"
            data-testid={`comment-${i}`}
          >
            <div className="flex items-center space-x-2">
              <ProfilePicture userAddress={comment?.userAddress} />
              <div>
                <h4
                  className="font-bold text-sm"
                  data-testid="comment-username"
                >
                  {user?.username || "Anonymous"}
                </h4>
                <p className="text-xs text-gray-500" data-testid="comment-date">
                  {comment?.timestamp?.seconds
                    ? convertTimestampToDate(comment.timestamp.seconds)
                    : "Just now"}
                </p>
              </div>
            </div>
            <p className="text-sm mt-2" data-testid="comment-text">
              {comment?.text}
            </p>
          </div>
        );
      })}
    </>
  );
};
