import { useRef, useState } from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";

import Loader from "@/components/Loader";
import { useUploadFile } from "@/lib/hooks";
import { useUserData } from "@/lib/hooks";

interface IImageUploaderProps {
  onUpload: (url: string) => void;
}

export default function ImageUploader({ onUpload }: IImageUploaderProps) {
  const { user } = useUserData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploading, progress } = useUploadFile();
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.length) return;

    const file = e.target.files[0];
    const validTypes = ["image/png", "image/jpeg", "image/gif"];

    if (!validTypes.includes(file.type)) {
      setError("Invalid file type");
      return;
    }

    const url = await uploadFile(file, `uploads/${user.uid}`);
    if (url) onUpload(url);
  };

  return (
    <div className="box flex items-center justify-center" data-testid="image-uploader">
      <Loader show={uploading} />
      {uploading && <h3 data-testid="upload-progress">{progress}%</h3>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!uploading && (
        <>
          <button className="text-gray-500" onClick={() => fileInputRef.current?.click()} data-testid="upload-button">
            <PhotoIcon className="h-6 w-6" />
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png,image/jpeg,image/gif" className="hidden" data-testid="file-input" />
        </>
      )}
    </div>
  );
}