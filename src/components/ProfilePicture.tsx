import React, { useEffect, useState } from "react";
import { minidenticon } from "minidenticons";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";

import { storage, db } from "@/lib/firebase";
import { useUserData } from "@/lib/hooks";

const MAX_FILE_SIZE = 1 * 1024 * 1024;

interface IProfilePicture {
  userAddress: string;
  isEditable?: boolean;
}

export default function ProfilePicture({ userAddress, isEditable }: IProfilePicture) {
  const { username, userData, user } = useUserData(userAddress);

  const [image, setImage] = useState(userData?.photoURL || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setImage(userData?.photoURL);
  }, [userData?.photoURL]);

  const isValidFileType = (fileType: string): boolean =>
    ["image/jpeg", "image/png"].includes(fileType);

  const handleImageUpload = async (file: File) => {
    if (!user?.uid) return;

    const storageRef = ref(storage, `profilePictures/${user.uid}/${username}`);
    await uploadBytes(storageRef, file);

    return getDownloadURL(storageRef);
  };

  const updateProfilePicture = async (photoURL: string) => {
    if (!user?.uid) return;

    await updateDoc(doc(db, "users", user.uid), { photoURL });
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!isValidFileType(file.type) || file.size > MAX_FILE_SIZE) {
      return toast.error("Invalid file type or size");
    }

    const reader = new FileReader();

    reader.onloadend = async () => {
      setImage(reader.result);
      setLoading(true);

      try {
        const photoURL = await handleImageUpload(file);

        if (!photoURL) return toast.error("Error getting URL");

        await updateProfilePicture(photoURL);

        toast.success("Profile picture updated successfully");
      } catch {
        toast.error("Error updating profile picture");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div data-testid="profile-picture-container">
      <label htmlFor="profilePictureInput">
        {!image ? (
          <div
            data-testid="default-profile-picture"
            dangerouslySetInnerHTML={{
              __html: minidenticon(userAddress, 50, 50),
            }}
          />
        ) : (
          <img
            src={image}
            alt="Profile"
            style={{ width: "50px", height: "50px", borderRadius: "50%", cursor: "pointer" }}
            data-testid="uploaded-profile-picture"
          />
        )}
      </label>
      {isEditable && (
        <input
          id="profilePictureInput"
          type="file"
          onChange={handleChange}
          style={{ display: "none" }}
          accept="image/jpeg,image/png"
          data-testid="file-input"
        />
      )}
      {loading && <p data-testid="loading-text">Loading...</p>}
    </div>
  );
}
