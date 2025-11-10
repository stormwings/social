import { useState, useEffect, useMemo } from "react";
import {
  collection,
  collectionGroup,
  query,
  orderBy,
  where,
  getDocs,
  DocumentData,
  doc,
  DocumentReference,
  setDoc,
  serverTimestamp,
  writeBatch,
  increment,
} from "firebase/firestore";
import { useDocument } from "react-firebase-hooks/firestore";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { auth, db } from "@/lib/firebase";

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

      const limitedUserKeys = userKeys.slice(0, 10); // limita a los primeros 10 keys

      const postsRef = collectionGroup(db, "posts"); // asumiendo que los posts están en una colección 'posts'
      const q = query(
        postsRef,
        where("uid", "in", limitedUserKeys),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map((doc) => {
        const data = doc.data() as Post; // Asegúrate de tipar correctamente los datos de tu post
        data.id = doc.id;
        data.postId = doc.id;
        return data;
      });

      setKeyedPosts(posts);
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

    const ref = doc(collection(db, `users/${user.uid}/posts`));

    const { content } = data;

    const postData = {
      username: username,
      uid: user.uid,
      published: true,
      content: content,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      heartCount: 0,
      images: images,
    };

    await setDoc(ref, postData);

    toast.success("Post created!");
    router.push("/private/posts");
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
    if (!enabled) return;
    const batch = writeBatch(db);
    batch.update(postRef!, { heartCount: increment(hasHeart ? -1 : 1) });
    if (heartRef) {
      hasHeart ? batch.delete(heartRef) : batch.set(heartRef, { uid });
    }
    await batch.commit();
  };

  return { hasHeart, toggleHeart, enabled };
}
