"use client";

import Link from "next/link";

import { useBuyPrice, useUserData, useUserProfileByUsername } from "@/lib/hooks";

import { HeartIcon } from "@heroicons/react/24/outline";
import ProfilePicture from "@/components/ProfilePicture";
import Topbar from "@/components/Topbar";

export default function UserProfile({ params }: { params: { username: string } }) {
    const subjectUsername = params.username;

    const { user } = useUserData();
    const { userProfile, userUID, subjectEthereumAddress } = useUserProfileByUsername(subjectUsername);
    const buyPrice = useBuyPrice({ ethereumAddress: subjectEthereumAddress });

    if (!userProfile)
        return (
            <div className="min-h-screen flex flex-col items-center justify-between p-2">
                <div className="pt-16" />
                <div className="flex flex-col items-center">
                    <p className="font-semibold mt-4">Loading</p>
                </div>
            </div>
        );

    return (
        <div className="min-h-screen">
            <Topbar />
            <div className="max-w-sm mx-auto">
                <div className="w-24 h-24 mb-3 rounded-full overflow-hidden mx-auto mt-4">
                    <ProfilePicture userAddress={userProfile.ethereumAddress} />
                </div>
                <h1 className="text-xl font-bold mb-2">{userProfile.username}</h1>
                <p className="text-sm mb-2">
                    {userProfile.holders} holders • {1} holding
                </p>
                <div className="flex space-x-2 justify-center items-center mb-4">
                    <HeartIcon className="h-5 w-5" />
                </div>
                <div className="grid grid-cols-1 gap-4">
                    <div className="flex justify-center items-center w-full my-4">
                        <div className="border-t flex-grow"></div>
                            <div className="px-4 text-xs font-bold">
                                {buyPrice ? `${buyPrice} USDT` : "Loading..."}
                            </div>
                        <div className="border-t flex-grow"></div>
                    </div>
                    <div className="text-sm text-left my-4">
                        <p className="mb-3">Address: {userProfile.ethereumAddress}</p>
                        <p className="mb-3">Buy Price: {buyPrice ? buyPrice : "N/A"}</p>
                    </div>
                    {user ? (
                        <Link href={`/private/profile/${userUID}`}>
                            <button className="mt-4 py-2 px-4 rounded-full w-full">
                                Profile
                            </button>
                        </Link>
                    ) : (
                        <Link href={`/login?redirect=/profile/${userUID}`}>
                            <button className="mt-4 py-2 px-4 rounded-full w-full">
                                Login
                            </button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}