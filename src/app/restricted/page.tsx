"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HeartIcon } from "@heroicons/react/24/solid";

import useLocalStorage from "src/hooks/useLocalStorage";

export default function RestrictedPostPage() {
  return (
    <main>
      <RestrictedPostDetail />
    </main>
  );
}

function RestrictedPostDetail() {
  const [nameProfileSelected] = useLocalStorage("profile_selected", null);

  const searchParams = useSearchParams();
  const isProfileView = searchParams.get("isProfile");

  return (
    <div className="min-h-screen">
      <div className="max-w-sm mx-auto">
        <div className="rounded-lg max-w-sm pt-32 w-full">
          <div className="flex flex-col items-center p-6">
            <div className="relative inline-block">
              <div className="p-2 rounded-full absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                <HeartIcon width={20} />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-4 mt-6">
              {isProfileView ? nameProfileSelected || "User Account" : "See more content"}
            </h2>
            <p className="text-sm text-center mb-16">
              {isProfileView
                ? "Log in to discover more content from this user."
                : "Log in to explore more content and connect with others."}
            </p>
            <div className="w-full mb-4">
              <Link href="/login">
                <button className="w-full py-2 mb-8 rounded-md">Sign Up</button>
              </Link>
              <p className="mb-1 text-center">Already have an account?</p>
              <Link href="/login">
                <button className="w-full cursor-pointer text-center">Log In</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
