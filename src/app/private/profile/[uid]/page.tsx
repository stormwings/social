"use client";

import { useEffect, useState } from "react";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";

import {
  useBuyPrice,
  useKeyCount,
  useUserData,
  useUserPosts,
  useUserProfileByUid,
} from "@/lib/hooks";
import { BuyKeyModal } from "@/components/BuyKeyModal";
import { SellKeyModal } from "@/components/SellKeyModal";
import ProfilePicture from "@/components/ProfilePicture";
import Topbar from "@/components/Topbar";
import AdminPostFeed from "@/components/AdminPostFeed";

import Utils from "@/lib/utils";

export default function UserProfile({ params }: { params: { uid: string } }) {
  const { user, ethereumAddress } = useUserData();
  const subjectUID = params.uid;

  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [countdown, setCountdown] = useState(false);

  const posts = useUserPosts(user);
  const { userProfile, userEthereumAddress } = useUserProfileByUid(subjectUID);

  const keyCount = useKeyCount({
    ethereumAddress,
    subjectEthereumAddress: userEthereumAddress,
  });
  const buyPrice = useBuyPrice({ ethereumAddress: userEthereumAddress });

  useEffect(() => {
    if (countdown) {
      const timer = setTimeout(() => setCountdown(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!userProfile)
    return (
      <div className="min-h-screen flex flex-col items-center justify-between bg-gray-100 p-2">
        <div className="pt-16" />
        <div className="flex flex-col items-center">
          <p className="text-gray-600 font-semibold mt-4">Loading...</p>
        </div>
      </div>
    );

  return (
      <div className="min-h-screen">
        <Topbar />
        <div className="max-w-sm mx-auto mt-7">
          <div className="bg-white text-black">
            <div className="relative">
              <div className="flex justify-between items-start px-4">
                <div className="w-24">
                  <ProfilePicture userAddress={userProfile.ethereumAddress} />
                </div>
                <div className="flex space-x-2">
                  {keyCount && keyCount > 0 && (
                    <button
                      onClick={() => setIsSellModalOpen(true)}
                      className="text-sm bg-gray-300 rounded-full px-4 py-1"
                    >
                      Sell
                    </button>
                  )}
                  <button
                    onClick={() => setIsBuyModalOpen(true)}
                    className="bg-gray-600 text-white rounded-full px-4 py-1"
                  >
                    Buy
                  </button>
                </div>
              </div>
            </div>

            <div className="px-4 pt-6 pb-4">
              <h1 className="font-bold text-2xl">{userProfile.username}</h1>
              <p className="text-gray-700">
                @{userProfile.displayName || userProfile.username}
              </p>
            </div>

            <div className="px-4 pb-4 pt-4 text-sm flex border-t">
              <p className="text-gray-600 font-bold mr-1">Address:</p>
              <p className="font-bold text-gray-700 mr-1">
                {Utils.shortenAddress(`${userEthereumAddress}`)}
              </p>
              {countdown ? (
                <CheckIcon className="h-5 w-5 text-gray-500 cursor-pointer" />
              ) : (
                <ClipboardIcon
                  className="h-5 w-5 text-gray-500 cursor-pointer"
                  onClick={() => {
                    Utils.copyToClipboard(userEthereumAddress || "");
                    setCountdown(true);
                  }}
                />
              )}
            </div>

            <div className="px-4 pb-4 text-sm flex">
              <p className="text-gray-600 font-bold mr-1">Price:</p>
              <p className="font-bold text-gray-700">
                {buyPrice ? buyPrice : null} USDT
              </p>
            </div>

            <div className="px-4 py-4 flex justify-between border-t border-b">
              <div>
                <span className="font-bold">{userProfile.holders}</span> Holders
              </div>
              <div>
                {keyCount !== null ? (
                  <p className="flex">
                    You have <span className="font-bold mx-1">{keyCount}</span>{" "}
                    Keys
                  </p>
                ) : (
                  <p>Loading...</p>
                )}
              </div>
            </div>

            <div className="flex justify-around text-sm font-bold py-2">
              <div className="text-gray-700">Posts</div>
              <div className="text-gray-300">Media</div>
              <div className="text-gray-300">Likes</div>
            </div>

            <div className="pt-4 border-t">
              {keyCount && keyCount > 0 && posts && (
                <AdminPostFeed posts={posts} />
              )}
            </div>
          </div>
          {userEthereumAddress && (
            <BuyKeyModal
              isOpen={isBuyModalOpen}
              setIsOpen={setIsBuyModalOpen}
              keyAddress={userEthereumAddress}
              subjectUID={subjectUID}
            />
          )}
          {userEthereumAddress && keyCount && keyCount > 0 && (
            <SellKeyModal
              isOpen={isSellModalOpen}
              setIsOpen={setIsSellModalOpen}
              keyAddress={userEthereumAddress}
              subjectUID={subjectUID}
            />
          )}
        </div>
      </div>
    );
}