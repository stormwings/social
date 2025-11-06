"use client";

import PostFeed from "@/components/smart/posts/PostFeed";
import TopbarMedia from "@/components/TopbarMedia";
import AnimationEmpty from "@/components/animations/AnimationEmpty";
import { useUserData, useUserKeys, useKeyedPosts } from "@/lib/hooks";

export default function KeyedPosts() {
  const { user } = useUserData();
  const userKeys = useUserKeys(user);
  const keyedPosts = useKeyedPosts(userKeys);

  if (keyedPosts.length === 0) {
    return (
      <div className="min-h-screen">
        <TopbarMedia title="Home" showBack />
        <div className="max-w-sm mx-auto">
          <div className="mb-20 max-w-2xl mx-auto py-24 px-4 sm:px-6 lg:px-4">
            <AnimationEmpty />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopbarMedia title="Home" showBack />
      <div className="max-w-sm mx-auto">
        <div className="mb-20 max-w-2xl mx-auto py-4 px-4 sm:px-6 lg:px-4">
          <PostFeed posts={keyedPosts} />
        </div>
      </div>
    </div>
  );
}
