import React from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";

import { useUserProfileByUsername, usePostRef } from "@/lib/hooks";

import PostImages from "@/components/dumb/PostImages";
import HeartButton from "@/components/smart/posts/HeartButton";

import { DocumentData } from "firebase/firestore";

interface IPostFeedProps {
  posts: DocumentData[];
}

const PostFeed = ({ posts }: IPostFeedProps) => {
  if (!posts || posts.length === 0) return null;
  return posts.map((post) => (
    <PostItem key={post.id ?? post.postId} post={post} />
  ));
};

interface IPostItemProps {
  post: DocumentData;
}

export const PostItem = ({ post }: IPostItemProps) => {
  const router = useRouter();
  const { userUID } = useUserProfileByUsername(post.username);

  const postIdForRef: string | undefined = post.postId ?? post.id;
  const postRef = usePostRef(post.uid, postIdForRef);

  const onGoToUserProfile = () => {
    if (userUID) router.push(`/private/profile/${userUID}`);
  };

  return (
    <div
      className="card p-4 my-4 bg-white rounded-xl shadow-md hover:cursor-pointer"
      data-testid={`post-${postIdForRef}`}
    >
      <div className="flex items-center space-x-4">
        <button onClick={onGoToUserProfile}>
          <span
            className="text-lg font-semibold hover:text-blue-600"
            data-testid="post-username"
          >
            @{post.username}
          </span>
        </button>
      </div>

      <Link
        href={`/private/posts/${post.username}/${post.postId}`}
        className="block"
      >
        <div className="mt-2 mb-2 text-gray-900" data-testid="post-content">
          <ReactMarkdown>{post?.content}</ReactMarkdown>
        </div>
      </Link>

      {post.images?.length > 0 && (
        <Link href={`/private/posts/${post.username}/${post.postId}`}>
          <PostImages images={post.images} />
        </Link>
      )}

      <footer
        className="flex justify-between mt-4 text-gray-600"
        data-testid="post-footer"
      >
        {postRef && (
          <HeartButton postRef={postRef} heartCount={post.heartCount} />
        )}
      </footer>
    </div>
  );
};

export default PostFeed;
