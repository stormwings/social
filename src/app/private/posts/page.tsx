"use client";

import AuthCheck from "@/components/AuthCheck";
import AdminPostFeed from "@/components/smart/posts/AdminPostFeed";
import TopbarMedia from "@/components/TopbarMedia";
import AnimationEmpty from "@/components/animations/AnimationEmpty";

import { useUserData, useUserPosts } from "@/lib/hooks";

export default function AdminPostsPage() {
  return (
    <main>
      <AuthCheck>
        <PostList />
      </AuthCheck>
    </main>
  );
}

function PostList() {
  const { user } = useUserData();

  const posts = useUserPosts(user);

  if (posts?.length === 0) {
    return (
      <div className="min-h-screen">
        <TopbarMedia
          title="Posts"
          customNavigate="Create"
          customNavigateLocation="/private/posts/create"
        />
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
      <TopbarMedia
        title="Posts"
        customNavigate="Create"
        customNavigateLocation="/private/posts/create"
      />
      <div className="max-w-sm mx-auto mt-4">
        {posts && <AdminPostFeed posts={posts} />}
      </div>
    </div>
  );
}
