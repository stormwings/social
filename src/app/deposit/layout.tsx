"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import AuthCheck from "@/components/AuthCheck";

const FallbackComponent = () => {
  const router = useRouter();

  // user not authenticated, redirect to login
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/restricted");
    }, 8000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gray-100 p-2">
      <div className="pt-16" />
      <div className="flex flex-col items-center">
        <p className="text-gray-600 font-semibold mt-4">Loading...</p>
      </div>
    </div>
  );
};

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <AuthCheck fallback={<FallbackComponent />}>
        {children}
        <Navbar />
      </AuthCheck>
    </div>
  );
}