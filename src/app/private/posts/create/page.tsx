"use client";

import ReactMarkdown from "react-markdown";
import Link from "next/link";
import Image from "next/image";

import AuthCheck from "@/components/AuthCheck";
import ImageUploader from "@/components/ImageUpload";

import { useUserData, usePostForm } from "@/lib/hooks";

export default function AdminPostEdit() {
  return (
    <AuthCheck>
      <PostManager />
    </AuthCheck>
  );
}

function PostManager() {
  const { user, username } = useUserData();
  const {
    register,
    handleSubmit,
    errors,
    watch,
    images,
    handleImageUpload,
    preview,
    setPreview,
    createPost,
  } = usePostForm(user, username || '');

  if (preview) {
    return (
      <div className="card p-4 border rounded-md shadow">
        <ReactMarkdown>{watch("content")}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <form onSubmit={handleSubmit(createPost)}>
        <div className="flex justify-between items-center mb-4">
          <Link href="/private/posts">
            <button className="text-gray-500">Cancel</button>
          </Link>
          <button className="text-white bg-gray-600 py-2 px-4 rounded-full" type="submit">
            Publish
          </button>
        </div>
        <div className="max-w-sm mx-auto">
          <textarea
            className="w-full p-2 text-lg border border-gray-300 placeholder:text-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            {...register("content", { required: true })}
            rows={6}
            placeholder="Write your post content here..."
          />
          {errors.content && <span className="text-gray-500">This field is required</span>}

          {images.map((img, idx) => (
            <Image
              key={idx}
              src={img}
              alt={`Uploaded content ${idx}`}
              width={192}
              height={192}
              className="object-cover rounded-md m-2"
            />
          ))}

          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-500 text-sm">Character limit: 0/255</span>
            <div className="flex space-x-2">
              {!preview && <ImageUploader onUpload={handleImageUpload} />}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
