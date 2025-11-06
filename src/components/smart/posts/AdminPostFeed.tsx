"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

import PostImages from "@/components/dumb/PostImages";
import { useUserProfileByUsername } from "@/lib/hooks";

import { DocumentData } from "firebase/firestore";
import { HeartIcon, PencilIcon } from "@heroicons/react/24/outline";

interface IAdminPostFeedProps {
  posts: DocumentData[];
  isOwner?: boolean;
}

const AdminPostFeed = ({ posts, isOwner }: IAdminPostFeedProps) => (
  <div data-testid="admin-post-feed" className="mb-20">
    {posts?.map((post, i) => (
      <AdminPostItem post={post} key={i} isOwner={isOwner} />
    ))}
  </div>
);

interface IAdminPostItemProps {
  post: DocumentData;
  isOwner?: boolean;
}

const AdminPostItem = ({ post, isOwner }: IAdminPostItemProps) => {
  const router = useRouter();
  const { userUID } = useUserProfileByUsername(post.username);

  const onGoToUserProfile = () => {
    if (userUID) router.push(`/private/profile/${userUID}`);
  };

  return (
    <div
      className="bg-white p-4 mb-4 rounded-lg shadow"
      data-testid={`post-${post.id}`}
    >
      <div className="flex justify-between items-center mb-2">
        <button onClick={onGoToUserProfile}>
          <h2 className="text-md font-bold" data-testid="post-author">
            By @{post.username}
          </h2>
        </button>
        {isOwner && (
          <Link
            href={`/private/posts/${post.username}/${post.postId}`}
            passHref
          >
            <span
              className={`text-sm font-semibold ${
                post.published ? "text-black" : "text-gray-500"
              }`}
              data-testid="post-status"
            >
              {post.published ? "Activo" : "Borrador"}
            </span>
          </Link>
        )}
      </div>

      <Link href={`/private/posts/${post.username}/${post.postId}`}>
        <ReactMarkdown className="text-gray-700" data-testid="post-content">
          {post?.content}
        </ReactMarkdown>
        <PostImages images={post.images || []} />
      </Link>

      <div className="flex justify-between items-center mt-4">
        <div
          className="flex items-center text-gray-600 text-sm"
          data-testid="post-hearts"
        >
          <HeartIcon className="h-6 w-6 mr-1" />
          <span>{post.hearts || 0} Likes</span>
        </div>
        {isOwner && (
          <Link href={`/posts/edit/${post.postId}`} passHref>
            <button
              className="text-gray-600 hover:text-gray-900"
              data-testid="post-edit"
            >
              <PencilIcon className="h-6 w-6" />
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default AdminPostFeed;
