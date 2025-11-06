"use client";

import { useUserData, useUsdtBalance } from "@/lib/hooks";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";

import Link from "next/link";

import ProfilePicture from "@/components/smart/ProfilePicture";
import Topbar from "@/components/Topbar";

export default function Account() {
  const { userData, ethereumAddress } = useUserData();
  const usdtBalance = useUsdtBalance({ ethereumAddress });

  return (
    <div className="min-h-screen">
      <Topbar />
      <div className="max-w-sm mx-auto">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <ProfilePicture
              userAddress={ethereumAddress ? ethereumAddress : ""}
              isEditable
            />
          </div>

          <div>
            <h2 className="font-semibold text-lg">@{userData?.username}</h2>
            <p className="text-black-500 mb-1 text-xs">
              {userData?.holders}{" "}
              {userData?.holders === 1 ? "holder" : "holders"}
            </p>
            <p className="text-gray-600 text-xs">
              {usdtBalance}
              <span className="ml-1">USDT</span>
            </p>
          </div>
        </div>

        <div className="my-8 p-4 border-2 border-gray-300 rounded-lg bg-gray-100">
          <h3 className="flex items-center text-gray-500 font-medium mb-4">
            <CurrencyDollarIcon className="h-5 w-5 mr-2" />
            Balance
          </h3>
          <p className="text-sm p-2 border border-gray-300 rounded-lg mb-1">
            {usdtBalance ? `${usdtBalance} USDT` : "Loading..."}
          </p>
          <p className="text-black-500 mb-6 text-xs">
            Available in your account
          </p>

          <div className="flex justify-around">
            <Link
              className="bg-gray-400 text-white font-normal py-2 px-4 rounded-lg w-full"
              href="/deposit"
            >
              <button className="w-full">Deposit</button>
            </Link>
            <Link
              className="text-black font-normal py-2 px-4 rounded-lg w-full"
              href="/private/withdraw"
            >
              <button className="w-full">Withdraw</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
