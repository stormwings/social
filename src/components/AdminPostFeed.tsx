/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

import PostImages from "@/components/PostImages";
import { useUserProfileByUsername } from "@/lib/hooks";

import { DocumentData } from "firebase/firestore";
import {
  HeartIcon,
  PencilIcon,
  ChatBubbleLeftIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";

import "./AdminPostFeed.css";

// TODO: Add the images handling (see PostImages.tsx)
import feet from "./../public/images/feet.jpg";
import vampire from "./../public/images/vapire.png";
import riko from "./../public/images/riko2.jpeg";

interface IAdminPostFeedProps {
  posts: DocumentData[];
}

const AdminPostFeed = ({ posts }: IAdminPostFeedProps) => (
  <div data-testid="admin-post-feed" className="mb-20">
    {posts?.map((post, i) => (
      <AdminPostItem post={post} key={i} />
    ))}
  </div>
);

interface IAdminPostItemProps {
  post: DocumentData;
}

const AdminPostItem = ({ post }: IAdminPostItemProps) => {
  const router = useRouter();
  const { userUID } = useUserProfileByUsername(post.username);

  const onGoToUserProfile = () => {
    if (userUID) router.push(`/private/profile/${userUID}`);
  };

  return (
    <div className="post" data-testid={`post-${post.id}`}>
      <div className="post-header">
        <div className="post-header-content">
          <div className="top-line">
            <div className="user-block">
              <img src={vampire.src} alt="Avatar" className="avatar" />
            </div>

            <div className="contenedorcito">
              <button onClick={onGoToUserProfile}>
                <span className="username">{post.username}</span>
                <span className="handle">By @{post.username}</span>
              </button>
            </div>

            <div className="time-block">
              <span className="time">2 hours ago ...</span>
            </div>
          </div>

          <div className="post-content">
            <Link href={`/private/posts/${post.username}/${post.postId}`}>
              <ReactMarkdown
                className="text-gray-700"
                data-testid="post-content"
              >
                {post?.content}
              </ReactMarkdown>
              {post.images && <PostImages images={post.images || []} />}
            </Link>
          </div>

          <div className="related-profiles">
            {/* TODO: Add the images handling (see PostImages.tsx) */}
            <div className="profile-card">
              <div
                className="profile-card-bg"
                style={{ backgroundImage: `url(${feet.src})` }}
              ></div>
              <div className="profile-card-content">
                <img
                  className="card-avatar"
                  src={vampire.src}
                  alt="Hagen Avatar"
                />

                <div className="card-text">
                  <span className="profile-name">Vampire ✔️</span>
                  <span className="profile-handle">@Vampire.AI</span>
                </div>
              </div>
            </div>

            <div className="profile-card">
              <div
                className="profile-card-bg"
                style={{ backgroundImage: `url(${riko.src})` }}
              ></div>
              <div className="profile-card-content">
                <img className="card-avatar" src={riko.src} alt="OFTV Logo" />
                <div className="card-text">
                  <span className="profile-name">Riko ✔️</span>
                  <span className="profile-handle">@Riko.L</span>
                </div>
              </div>
            </div>
          </div>

          <div className="post-actions flex justify-between items-center mt-4">
            <button
              onClick={() => {}}
              className="flex items-center text-gray-600 text-sm"
              data-testid="post-hearts"
            >
              <HeartIcon className="h-6 w-6 mr-1" />
              <span>{post.hearts || 0}</span>
            </button>

            <button
              onClick={() => {}}
              className="flex items-center text-gray-600 text-sm"
              data-testid="post-comments"
            >
              <ChatBubbleLeftIcon className="h-6 w-6 mr-1" />
              <span>{post.commentsCount || 0}</span>
            </button>

            <button
              onClick={() => {}}
              className="text-gray-600 hover:text-gray-900"
              data-testid="post-retweet"
            >
              <ArrowsRightLeftIcon className="h-6 w-6" />
            </button>

            <Link href={`/posts/edit/${post.postId}`}>
              <button
                className="text-gray-600 hover:text-gray-900"
                data-testid="post-pin"
              >
                <PencilIcon className="h-6 w-6" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPostFeed;
