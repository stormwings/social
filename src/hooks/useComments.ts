import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, getDocs, serverTimestamp , where } from 'firebase/firestore';

export interface IComment {
  commentId?: string;
  postId: string;
  userId: string;
  userAddress: string;
  text: string;
  timestamp: any;
}

interface useCommentsInterface {
  comments: IComment[];
  sendComment: (text: string, creatorAddress: string) => Promise<void>;
}

export const useComments = (postId: string, userId: string): useCommentsInterface => {
  const [comments, setComments] = useState<IComment[]>([]);

  useEffect(() => {
    const fetchComments = async () => {
      const commentsQuery = query(
        collection(db, 'comments'),
        where('postId', '==', postId),
        orderBy('timestamp', 'asc')
      );
      const querySnapshot = await getDocs(commentsQuery);

      const commentsData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        commentId: doc.id,
      } as IComment));

      setComments(commentsData);
    };

    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const sendComment = async (text: string, userAddress: string) => {
    const newComment: IComment = {
      postId: postId,
      userId: userId,
      userAddress: userAddress,
      text: text,
      timestamp: serverTimestamp(),
    }

    await addDoc(collection(db, 'comments'), newComment);

    const newCommentsList = [newComment, ...comments];

    setComments(newCommentsList);
  };

  return { comments, sendComment };
};
