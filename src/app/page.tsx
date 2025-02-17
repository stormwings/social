"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-100">
      <div className="w-full flex flex-col items-center space-y-4 pb-8">
        <Link
          href="/login"
          className="w-full max-w-xs bg-primary text-black font-bold py-3 px-6 rounded-md text-center"
        >
          <span>Start</span>
        </Link>
      </div>
    </div>
  );
}
