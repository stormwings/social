import React from "react";

import TopbarMedia from "@/components/TopbarMedia";

export const PostDetailSkeleton = () => {
  return (
    <div className="min-h-screen">
      <TopbarMedia title="Post" showBack />
      <div className="max-w-sm mx-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded mt-1"></div>
                </div>
              </div>
            </div>
            <div className="my-2 mt-8">
              <div className="h-4 bg-gray-200 rounded mx-4 my-2"></div>
            </div>
            <div className="px-4 py-2">
              <div className="flex space-x-4 text-red-600 text-xs">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
          <div className="px-4 py-2 animate-pulse">
            <div className="flex space-x-4 text-red-600 text-xs">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-2 border-t animate-pulse">
            <div className="flex space-x-4">
              <div className="h-4 bg-gray-200 rounded w-12"></div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
          <div className="border-t animate-pulse">
            <div className="p-4 flex space-x-2">
              <div className="h-10 w-10 rounded-full bg-gray-200"></div>
              <div className="flex-grow bg-gray-100 rounded-full py-2 px-4 text-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
