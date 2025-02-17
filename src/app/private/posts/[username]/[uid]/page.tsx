"use client";

import AuthCheck from "@/components/AuthCheck";
import TopbarMedia from "@/components/TopbarMedia";
import PostImages from "@/components/PostImages";
import ProfilePicture from "@/components/ProfilePicture";
import { TipModal } from "@/components/TipModal";

import { db } from "@/lib/firebase";
import { usersKeysAddress, RPC_ENDPOINT } from "@/lib/dappParams";

import { useState, useEffect } from "react";
import { useUserData } from "@/lib/hooks";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  DocumentData,
} from "firebase/firestore";

import Link from "next/link";
import { ethers } from "ethers";

import { BanknotesIcon, ArrowUpIcon } from "@heroicons/react/24/outline";

import { handleMintPost } from "src/services/post.service";
import usersKeysAbi from "src/usersKeysAbi";
import CommentSection from "./CommentSection";

import { convertTimestampToDate } from "src/lib/utils";

export default function AdminPostsPage({
  params,
}: {
  params: { uid: string, username: string };
}) {
  return (
    <main>
      <AuthCheck>
        <PostDetail username={params.username} postId={params.uid} />
      </AuthCheck>
    </main>
  );
}

const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT);

function PostDetail({ postId, username }: any) {
  const { user, ethereumAddress } = useUserData();
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);

  const [posts, setPosts] = useState<DocumentData[] | null>(null);
  const [post, setPost] = useState<DocumentData | null>(null);
  const [userProfile, setUserProfile] = useState<DocumentData | null>(null);

  const [keyCount, setKeyCount] = useState(null);
  const [buyPrice, setBuyPrice] = useState<string | null>(null);
  const [userUID, setUserUID] = useState<string | null>(null);

  useEffect(() => {
    if (ethereumAddress && userProfile && userProfile.ethereumAddress) {
      const fetchKeyCount = async () => {
        const usersKeysCContract = new ethers.Contract(
          usersKeysAddress,
          usersKeysAbi,
          provider
        );

        try {
          const userKeyCount = await usersKeysCContract.keysBalance(
            userProfile.ethereumAddress,
            ethereumAddress
          );
          setKeyCount(userKeyCount.toString());
        } catch (error) {
          console.error("Error fetching key count:", error);
        }
      };

      fetchKeyCount();
    }
  }, [user, ethereumAddress, userProfile]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!userProfile || !userUID || posts !== null) return;
      const postsRef = collection(db, "users", userUID, "posts");
      const q = query(postsRef, orderBy("createdAt"));

      const querySnapshot = await getDocs(q);
      const postData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        postId: doc.id,
      }));

      setPosts(postData);
    };

    fetchPosts();
  }, [user, userProfile, userUID, posts]);

  useEffect(() => {
    async function fetchUserProfile() {
      const usersRef = query(
        collection(db, "users"),
        where("username", "==", username)
      );
      const userSnapshot = await getDocs(usersRef);
      userSnapshot.forEach((doc) => {
        setUserUID(doc.id);
        setUserProfile(doc.data());
      });
    }
    fetchUserProfile();
  }, [post, username]);

  useEffect(() => {
    async function fetchUserPost() {
      const currentPost = posts?.find((post) => post.postId === postId);

      if (currentPost) setPost(currentPost);
    }
    if (postId) {
      fetchUserPost();
    }
  }, [postId, posts]);

  useEffect(() => {
    if (userProfile && !userProfile.ethereumAddress) return;

    async function fetchBuyPrice() {
      const contract = new ethers.Contract(
        usersKeysAddress,
        usersKeysAbi,
        provider
      );
      try {
        if (userProfile && userProfile.ethereumAddress) {
          const price = await contract.getBuyPrice(
            userProfile.ethereumAddress,
            1
          );
          setBuyPrice(ethers.formatEther(price));
        } else {
          setBuyPrice("- ");
        }
      } catch (error) {
        console.error("Error fetching buy price:", error);
      }
    }
    fetchBuyPrice();
  }, [userProfile]);

  const handleCreatePost = async () => {
    handleMintPost({
      user,
      userUID,
      postId,
      ethereumAddress,
    });
  };

  const isUserCreator = post?.uid === user?.uid

  {/* (pending) check conditions */}
  const shouldRender = () => (isNaN(parseFloat(keyCount || "")) ? false : true);

  if (!shouldRender()) {
    return (
      <div className="min-h-screen">
        <TopbarMedia title="Post" showBack />
        <div className="max-w-sm mx-auto">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                  <div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded mt-1"></div>
                  </div>
                </div>
              </div>
              <div className="my-2 mt-8">
                <div className="h-4 bg-gray-200 rounded mx-4 my-2"></div>
              </div>
              <div className="px-4 py-2">
                <div className="flex space-x-4 text-red-600 text-xs">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
            <div className="px-4 py-2 animate-pulse">
              <div className="flex space-x-4 text-red-600 text-xs">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-2 border-t animate-pulse">
              <div className="flex space-x-4">
                <div className="h-4 bg-gray-200 rounded w-12"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
            <div className="border-t animate-pulse">
              <div className="p-4 flex space-x-2">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="flex-grow bg-gray-100 rounded-full py-2 px-4 text-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopbarMedia
        title="Post"
        customNavigate="Create"
        customNavigateLocation="/private/posts/create"
      />
      <div className="max-w-sm mx-auto">
        {/* (pending) check conditions */}
        {isUserCreator || (posts && keyCount && parseFloat(keyCount) > 0) ? (
          <>
            <div className="bg-white rounded-lg shadow">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-12 h-12 rounded-full rounded-full">
                      <ProfilePicture
                        userAddress={`${userProfile?.ethereumAddress}`}
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">@{userProfile?.username}</h4>
                      <p className="text-xs text-gray-500">
                        {userProfile?.holders ? (
                          `${userProfile.holders} ${userProfile.holders === 1 ? 'holder' : 'holders'}`
                        ) : (
                          'No holders'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-sm mt-2">{post?.content}</p>
                <PostImages images={post?.images || []} />
              </div>
              <div className="my-2">
                <div className="flex space-x-2 px-4"></div>
              </div>
              <div className="flex items-center justify-between px-4 py-2 border-t">
                <div className="flex space-x-4 text-gray-600 text-xs">
                  <span>{convertTimestampToDate(post?.createdAt?.seconds)}</span>
                </div>
                {/* <button
                  onClick={handleCreatePost}
                  className="flex items-center text-xs text-white bg-black rounded-full px-3 py-1"
                >
                  Publicar
                  <ArrowUpIcon className="h-5 w-5 text-white ml-1" />
                </button> */}
              </div>
              <div className="flex items-center justify-between px-4 py-2 border-t">
                <div className="flex space-x-4">
                  <span className="text-xs">{post?.heartCount} likes</span>
                </div>
                <button
                  onClick={() => setIsTipModalOpen(true)}
                  className="flex items-center text-xs text-white bg-black rounded-full px-3 py-1"
                >
                  <BanknotesIcon className="h-5 w-5 text-white mr-1" />
                  Contrib
                </button>
              </div>
              {user && <CommentSection postId={postId} user={{ uid: user.uid }} userAddress={`${ethereumAddress}`} />}
              <div className="mb-20" />
              <TipModal
                isOpen={isTipModalOpen}
                setIsOpen={setIsTipModalOpen}
                recipientAddress={userProfile?.ethereumAddress}
              />
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-lg max-w-sm mt-32 w-full">
              <div className="flex flex-col items-center p-6">
                <h2 className="text-xl font-bold mb-4">
                  {userProfile?.username}
                </h2>
                <p className="text-sm text-black text-center mb-16">
                  Must adquire to get this user.
                </p>
                <div className="w-full mb-4">
                  <Link href={`/private/profile/${userUID}`}>
                    <button className="w-full text-black py-2 rounded-full border-black border text-center mb-4">
                      Price:{" "}
                      <span className="font-bold">{buyPrice} USDT</span>
                    </button>
                    <button className="w-full bg-black text-white py-2 rounded-md">
                      Buy
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
