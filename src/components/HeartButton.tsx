import { doc, writeBatch, increment } from "firebase/firestore";
import { useDocument } from "react-firebase-hooks/firestore";

import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { HeartIcon as HeartOutlineIcon } from "@heroicons/react/24/outline";

import { auth, db } from "@/lib/firebase";

interface IHeartButtonProps {
  postRef: any;
  heartCount: number;
}

export default function HeartButton({ postRef, heartCount }: IHeartButtonProps) {
  const uid = auth.currentUser?.uid;
  const heartRef = uid ? doc(postRef, "hearts", uid) : doc(db, "dummy", "dummy");
  const [heartDoc] = useDocument(heartRef);

  const updateHeart = async (add: boolean) => {
    if (!uid || !heartRef) return;

    const batch = writeBatch(db);

    batch.update(postRef, { heartCount: increment(add ? 1 : -1) });
    add ? batch.set(heartRef, { uid }) : batch.delete(heartRef);

    await batch.commit();
  };

  return (
    <span className="flex">
      <button
        onClick={() => updateHeart(!heartDoc?.exists())}
        disabled={!uid}
        className={`flex items-center ${heartDoc?.exists() ? "text-red-500" : "text-gray-500 hover:text-red-500"}`}
        data-testid={heartDoc?.exists() ? "heart-button-remove" : "heart-button-add"}
      >
        {heartDoc?.exists() ? (
          <HeartSolidIcon className="h-6 w-6 mr-1" />
        ) : (
          <HeartOutlineIcon className="h-6 w-6 mr-1" />
        )}
        {heartCount > 0 && <span className="mr-1" data-testid="heart-count">{heartCount}</span>}
      </button>
    </span>
  );
};