"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";
import QRCode from "react-qr-code";

import { useUserData } from "@/lib/hooks";

import TopbarMedia from "@/components/TopbarMedia";
import Utils from "@/lib/utils";

export default function Deposit() {
    const { ethereumAddress } = useUserData();
    const [countdown, setCountdown] = useState(false);

    useEffect(() => {
        if (countdown) {
            const timer = setTimeout(() => setCountdown(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    return (
        <div className="min-h-screen">
            <TopbarMedia title="Deposit" showBack />
            <div className="max-w-sm mx-auto mt-8">
                <div className="mb-4 p-4 bg-gray-100 border border-gray-300 rounded-lg">
                    <p className="text-gray-700 text-sm font-semibold">
                        Deposit USDT
                    </p>

                    <div className="flex justify-center p-6">
                        <QRCode
                            bgColor="#F3F4F6"
                            fgColor="#374151"
                            size={256}
                            value={ethereumAddress || ""}
                            viewBox={`0 0 256 256`}
                        />
                    </div>

                    <div className="flex items-center bg-white p-2 rounded-full">
                        <input
                            onClick={() => {
                                Utils.copyToClipboard(ethereumAddress || "");
                                setCountdown(true);
                            }}
                            className="flex-grow pl-2 bg-transparent outline-none"
                            type="text"
                            value={
                                ethereumAddress
                                    ? Utils.shortenAddress(ethereumAddress, 15, 12)
                                    : "Loading..."
                            }
                            readOnly
                        />
                        {countdown ? (
                            <CheckIcon className="h-5 w-5 text-gray-700 cursor-pointer" />
                        ) : (
                            <ClipboardIcon
                                className="h-5 w-5 text-gray-700 cursor-pointer"
                                onClick={() => {
                                    Utils.copyToClipboard(ethereumAddress || "");
                                    setCountdown(true);
                                }}
                            />
                        )}
                    </div>

                    <div
                        onClick={() => {
                            Utils.copyToClipboard(ethereumAddress || "");
                            setCountdown(true);
                        }}
                        className="flex justify-center p-2 rounded-full"
                    >
                        <p className="text-xs text-gray-700">Copy Address</p>
                    </div>
                </div>

                <div className="mb-4 p-4 border rounded-lg">
                    <div className="p-4">
                        <p className="text-gray-700 font-semibold mb-2">
                            Deposit USDT or USDC
                        </p>
                        <p className="text-gray-500 text-xs mb-4">
                            Link your ERC20 wallet and easily to convert.
                        </p>
                    </div>
                    <button className="block w-full bg-gray-100 text-gray-700 py-2 mb-1 rounded-lg font-semibold text-center">
                        Deposit
                    </button>
                </div>
            </div>
        </div>
    );
}
