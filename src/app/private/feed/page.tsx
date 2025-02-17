"use client";

import Link from "next/link";
import { useState } from "react";
import { useUserData, useUserKeys, useTrades } from "@/lib/hooks";

import TradeItem from "@/components/TradeItem";
import Topbar from "@/components/Topbar";

const FILTERS = [
    { key: "userKeys", label: "You" },
    { key: "yourKey", label: "Your friends" },
    { key: "allTrades", label: "All" },
];

function UserFeed() {
    const { user } = useUserData();
    const [filter, setFilter] = useState<string>("userKeys");
    const userKeys = useUserKeys(user);
    const trades: any = useTrades({ user, userKeys, initialFilter: filter });

    return (
        <div className="min-h-screen">
            <Topbar />
            <div className="max-w-sm mx-auto mb-20">
                <div className="flex justify-around mb-4 py-2 bg-gray-100 rounded-full w-100">
                    {FILTERS.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-4 py-2 text-sm font-semibold rounded-full focus:outline-none ${
                                filter === key ? "bg-gray-400 text-white" : "bg-gray-100 text-gray-800"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="p-2">
                    {trades.length > 0 &&
                        trades.map((trade: any, i: any) => <TradeItem key={i} trade={trade} />)}
                </div>

                {userKeys.length === 0 && (
                    <div className="text-center space-y-2 pt-16">
                        <p className="text-lg">You have no trades at the moment.</p>
                        <hr className="my-4" />
                        <p className="text-gray-400 hover:underline">
                            <Link href={`/private/explorer`}>Explore</Link>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserFeed;
