"use client";

import Link from "next/link";

import AuthCheck from "@/components/AuthCheck";
import TopbarMedia from "@/components/TopbarMedia";
import PostImages from "@/components/dumb/PostImages";
import ProfilePicture from "@/components/smart/ProfilePicture";
import FormUserComments from "@/components/smart/FormUserComments";
import { PostDetailSkeleton } from "./page.skeleton";

import {
  useUserData,
  useUserProfileAndPostsByUsername,
  usePostById,
  useKeyCount,
  useBuyPrice,
} from "@/lib/hooks";

import { convertTimestampToDate } from "src/lib/utils";

export default function AdminPostsPage({
  params,
}: {
  params: { uid: string; username: string };
}) {
  return (
    <main>
      <AuthCheck>
        <PostDetail username={params.username} postId={params.uid} />
      </AuthCheck>
    </main>
  );
}

function PostDetailRestricted({
  userProfile,
  userUID,
  buyPrice,
}: {
  userProfile: any;
  userUID: any;
  buyPrice: any;
}) {
  return (
    <div className="bg-white rounded-lg max-w-sm mt-32 w-full">
      <div className="flex flex-col items-center p-6">
        <h2 className="text-xl font-bold mb-4">{userProfile?.username}</h2>
        <p className="text-sm text-black text-center mb-16">
          Must acquire to view this user.
        </p>
        <div className="w-full mb-4">
          <Link href={`/private/profile/${userUID}`}>
            <button className="w-full text-black py-2 rounded-full border-black border text-center mb-4">
              Price: <span className="font-bold">{buyPrice} USDT</span>
            </button>
            <button className="w-full bg-black text-white py-2 rounded-md">
              Buy
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function PostDetail({
  postId,
  username,
}: {
  postId: string;
  username: string;
}) {
  const { user, ethereumAddress } = useUserData();

  const { userProfile, userUID, posts, loadingProfile, loadingPosts } =
    useUserProfileAndPostsByUsername(username);
  const post = usePostById(posts, postId);

  const keyCount = useKeyCount({
    ethereumAddress,
    subjectEthereumAddress: userProfile?.ethereumAddress || null,
  });

  const buyPrice = useBuyPrice({
    ethereumAddress: userProfile?.ethereumAddress || null,
  });

  const loading = loadingProfile || loadingPosts;

  if (loading || !userProfile) {
    return <PostDetailSkeleton />;
  }

  if (!post) {
    return (
      <div className="min-h-screen">
        <TopbarMedia title="Post" showBack />
        <div className="max-w-sm mx-auto mt-16 text-center text-sm text-gray-600">
          Post not found.
        </div>
      </div>
    );
  }

  const isUserCreator = post?.uid === user?.uid;
  const canView =
    isUserCreator ||
    (!!keyCount &&
      !isNaN(parseFloat(String(keyCount))) &&
      parseFloat(String(keyCount)) > 0);

  return (
    <div className="min-h-screen">
      <TopbarMedia
        title="Post"
        customNavigate="Create"
        customNavigateLocation="/private/posts/create"
      />
      <div className="max-w-sm mx-auto mt-4">
        {canView ? (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-12 rounded-full">
                    <ProfilePicture
                      userAddress={`${userProfile?.ethereumAddress}`}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">
                      @{userProfile?.username}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {userProfile?.holders
                        ? `${userProfile.holders} ${
                            userProfile.holders === 1 ? "holder" : "holders"
                          }`
                        : "No holders"}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm mt-2">{post?.content}</p>
              <PostImages images={post?.images || []} />
            </div>

            <div className="flex items-center justify-between px-4 py-2 border-t">
              <div className="flex space-x-4">
                <span className="text-xs">{post?.heartCount} likes</span>
              </div>
              <div className="flex space-x-4 text-gray-600 text-xs">
                <span>{convertTimestampToDate(post?.createdAt?.seconds)}</span>
              </div>
            </div>

            {user && (
              <FormUserComments
                postId={postId}
                user={{ uid: user.uid }}
                userAddress={`${ethereumAddress}`}
              />
            )}
          </div>
        ) : (
          <PostDetailRestricted
            userProfile={userProfile}
            userUID={userUID}
            buyPrice={buyPrice}
          />
        )}
      </div>
    </div>
  );
}
