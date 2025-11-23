import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";
import { storage } from "@/lib/firebase";
import { withdrawalService } from "@/services";

export function useWithdraw(user: any) {
  const [isProcessing, setIsProcessing] = useState(false);

  const withdraw = async (data: { address: string; amount: number }) => {
    if (!user) {
      toast.error("User is not authenticated");
      return;
    }

    setIsProcessing(true);
    try {
      const token = await user.getIdToken();
      const response = await withdrawalService.withdrawUsdt(data, token);
      toast.success(response.message);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return { withdraw, isProcessing };
}

interface IUseUploadFile {
  uploadFile: (file: File, path: string) => Promise<string | null>;
  uploading: boolean;
  progress: number;
}

export function useUploadFile(): IUseUploadFile {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (
    file: File,
    path: string
  ): Promise<string | null> => {
    try {
      setUploading(true);
      const fileRef = ref(storage, `${path}/${Date.now()}-${file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            setProgress(
              Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              )
            );
          },
          (error) => {
            console.error("Upload error:", error);
            setUploading(false);
            reject(null);
          },
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            setUploading(false);
            resolve(url);
          }
        );
      });
    } catch (error) {
      console.error("Unexpected upload error:", error);
      setUploading(false);
      return null;
    }
  };

  return { uploadFile, uploading, progress };
}
