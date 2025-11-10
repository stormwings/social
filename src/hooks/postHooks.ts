import { useState, useEffect, useMemo } from "react";
import {
  collection,
  doc,
  DocumentData,
  DocumentReference,
  serverTimestamp,
} from "firebase/firestore";
import { useDocument } from "react-firebase-hooks/firestore";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { auth, db } from "@/lib/firebase";
import { postService } from "@/services";

type Post = {
  id: string;
  postId: string;
};

export const useKeyedPosts = (userKeys: string[]) => {
  const [keyedPosts, setKeyedPosts] = useState<Post[]>([]);

  useEffect(() => {
    async function fetchKeyedPosts() {
      if (userKeys.length === 0) {
        setKeyedPosts([]);
        return;
      }

      const posts = await postService.getKeyedPosts(userKeys);
      setKeyedPosts(posts as Post[]);
    }

    if (userKeys.length > 0) {
      fetchKeyedPosts();
    }
  }, [userKeys]);

  return keyedPosts;
};

type Inputs = {
  content: string;
};

export function usePostForm(user: any, username: string) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<Inputs>();

  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [preview, setPreview] = useState(false);

  const handleImageUpload = (url: string) => {
    setImages([...images, url]);
  };

  const createPost = async (data: Inputs) => {
    if (!user) return;

    const { content } = data;

    try {
      await postService.createPost(user.uid, {
        username: username,
        uid: user.uid,
        content: content,
        images: images,
      });

      toast.success("Post created!");
      router.push("/private/posts");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    watch,
    images,
    handleImageUpload,
    preview,
    setPreview,
    createPost,
  };
}

export function usePostById(posts: DocumentData[] | null, postId: string | null) {
  return useMemo(() => {
    if (!posts || !postId) return null;
    return posts.find(p => p.postId === postId) ?? null;
  }, [posts, postId]);
}

export function usePostRef(
  uid?: string | null,
  postId?: string | null
): DocumentReference | null {
  return useMemo(() => {
    if (!uid || !postId) return null;
    return doc(db, "users", uid, "posts", postId);
  }, [uid, postId]);
}

export function useHeart(postRef: DocumentReference | null) {
  const uid = auth.currentUser?.uid ?? null;

  const heartRef = useMemo(
    () => (postRef && uid ? doc(postRef, "hearts", uid) : null),
    [postRef, uid]
  );

  const [heartDoc] = useDocument(heartRef as any);
  const hasHeart = !!heartDoc?.exists();
  const enabled = !!uid && !!postRef;

  const toggleHeart = async () => {
    if (!enabled || !postRef || !uid) return;
    
    try {
      await postService.toggleHeart(postRef, uid, hasHeart);
    } catch (error) {
      console.error("Error toggling heart:", error);
      toast.error("Failed to update heart");
    }
  };

  return { hasHeart, toggleHeart, enabled };
}
