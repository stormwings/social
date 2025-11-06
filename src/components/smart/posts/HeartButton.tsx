"use client";

import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { HeartIcon as HeartOutlineIcon } from "@heroicons/react/24/outline";
import type { DocumentReference } from "firebase/firestore";
import { useHeart } from "@/lib/hooks";

interface Props {
  postRef: DocumentReference | null;
  heartCount: number;
}

export default function PostHeartButton({ postRef, heartCount }: Props) {
  const { hasHeart, toggleHeart, enabled } = useHeart(postRef);

  return (
    <span className="flex">
      <button
        onClick={toggleHeart}
        disabled={!enabled}
        aria-pressed={hasHeart}
        className={`flex items-center ${
          hasHeart ? "text-red-500" : "text-gray-500 hover:text-red-500"
        }`}
        data-testid={hasHeart ? "heart-button-remove" : "heart-button-add"}
        title={hasHeart ? "Remove like" : "Add like"}
      >
        {hasHeart ? (
          <HeartSolidIcon className="h-6 w-6 mr-1" />
        ) : (
          <HeartOutlineIcon className="h-6 w-6 mr-1" />
        )}
        {heartCount > 0 && (
          <span className="mr-1" data-testid="heart-count">
            {heartCount}
          </span>
        )}
      </button>
    </span>
  );
}
