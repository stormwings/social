"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import AuthCheck from "@/components/AuthCheck";

const FallbackComponent = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/restricted");
    }, 4000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-2">
        <p className="text-gray-600 font-semibold mt-4">Loading...</p>
      </div>
  );
};

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <AuthCheck fallback={<FallbackComponent />}>
        {children}
        <Navbar />
      </AuthCheck>
    </div>
  );
}