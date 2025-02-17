import React from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";

import { doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUserProfileByUsername } from "@/lib/hooks";

import PostImages from "@/components/PostImages";
import HeartButton from "@/components/HeartButton";

import { DocumentData } from "firebase/firestore";

interface IPostFeedProps {
  posts: DocumentData[];
}

const PostFeed = ({ posts }: IPostFeedProps) => {
  if (!posts || posts.length === 0) return null;
  return posts.map((post) => <PostItem key={post.id} post={post} />);
};

interface IPostItemProps {
  post: DocumentData;
}

const PostItem = ({ post }: IPostItemProps) => {
  const router = useRouter();
  const { userUID } = useUserProfileByUsername(post.username);
  const postRef = doc(db, "users", post.uid, "posts", post.id);

  const onGoToUserProfile = () => {
    if (userUID) router.push(`/private/profile/${userUID}`);
  };

  return (
    <div className="card p-4 my-4 bg-white rounded-xl shadow-md" data-testid={`post-${post.id}`}>
      <div className="flex items-center space-x-4">
        <button onClick={onGoToUserProfile}>
          <span className="text-lg font-semibold hover:text-blue-600" data-testid="post-username">
            @{post.username}
          </span>
        </button>
      </div>

      <Link href={`/private/posts/${post.username}/${post.postId}`} className="block">
        <div className="mt-2 mb-2 text-gray-900" data-testid="post-content">
          <ReactMarkdown>{post?.content}</ReactMarkdown>
        </div>
      </Link>

      {post.images?.length > 0 && (
        <Link href={`/private/posts/${post.username}/${post.postId}`}>
          <PostImages images={post.images} />
        </Link>
      )}

      <footer className="flex justify-between mt-4 text-gray-600" data-testid="post-footer">
        <HeartButton postRef={postRef} heartCount={post.heartCount} />
      </footer>
    </div>
  );
};

export default PostFeed;
