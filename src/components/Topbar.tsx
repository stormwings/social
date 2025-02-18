"use client";

import Link from "next/link";
import { useUsdtBalance, useUserData } from "@/lib/hooks";

const Topbar = () => {
  const { ethereumAddress } = useUserData();
  const usdtBalance = useUsdtBalance({ ethereumAddress });

  return (
    <div className="flex justify-between items-center p-4 mb-4 bg-white shadow" data-testid="topbar-container">
      <Link href="/private/home" data-testid="topbar-logo">
        Social
      </Link>
      <Link href="/private/account" data-testid="topbar-account-link">
        <div className="flex items-center">
          <span data-testid="topbar-currency-label">USDT</span>
          <span className="text-black font-normal text-lg ml-2" data-testid="stablecoin-balance">
            {usdtBalance ? `${usdtBalance}` : "Loading..."}
          </span>
        </div>
      </Link>
    </div>
  );
};

export default Topbar;
