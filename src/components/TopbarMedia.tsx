import React, { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

import { auth } from "../lib/firebase";

interface TopbarMediaProps {
  title: string;
  showBack?: boolean;
  customNavigate?: string;
  customNavigateLocation?: string;
}

const TopbarMedia = ({
  title,
  showBack = false,
  customNavigate,
  customNavigateLocation,
}: TopbarMediaProps) => {
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  }, [router]);

  return (
    <div
      className="flex justify-between items-center p-4 bg-white shadow"
      data-testid="topbar-media-container"
    >
      <button
        className="text-gray-600 font-semibold"
        onClick={() => router.back()}
        data-testid="topbar-media-back-button"
      >
        Back
      </button>
      <h1
        className="text-center text-gray-800 font-bold flex-grow"
        data-testid="topbar-media-title"
      >
        {title}
      </h1>
      {showBack ? (
        <button
          className="text-gray-600 font-semibold"
          onClick={handleSignOut}
          data-testid="topbar-media-logout-button"
        >
          Logout
        </button>
      ) : customNavigate && customNavigateLocation ? (
        <Link href={customNavigateLocation}>
          <button
            className="text-gray-600 font-semibold"
            data-testid="topbar-media-custom-button"
          >
            {customNavigate}
          </button>
        </Link>
      ) : (
        <div className="w-14" />
      )}
    </div>
  );
};

export default TopbarMedia;
