import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { commentsService, Comment } from '@/services';
import { logger } from '@/lib/logger';

// Re-export Comment interface for backward compatibility
export interface IComment extends Comment {}

interface useCommentsInterface {
  comments: IComment[];
  sendComment: (text: string, creatorAddress: string) => Promise<void>;
}

export const useComments = (postId: string, userId: string): useCommentsInterface => {
  const [comments, setComments] = useState<IComment[]>([]);

  useEffect(() => {
    const fetchComments = async () => {
      if (!postId) return;
      
      try {
        const commentsData = await commentsService.getCommentsByPostId(postId);
        setComments(commentsData);
      } catch (error) {
        logger.error("Error fetching comments", error, { postId });
        toast.error("Failed to load comments");
      }
    };

    fetchComments();
  }, [postId]);

  const sendComment = async (text: string, userAddress: string) => {
    try {
      const commentId = await commentsService.addComment({
        postId,
        userId,
        userAddress,
        text,
      });

      // Optimistically add comment to local state
      const newComment: IComment = {
        commentId,
        postId,
        userId,
        userAddress,
        text,
        timestamp: new Date(),
      };

      setComments([...comments, newComment]);
      toast.success("Comment added!");
    } catch (error) {
      logger.error("Error sending comment", error, { postId });
      toast.error("Failed to send comment");
    }
  };

  return { comments, sendComment };
};
