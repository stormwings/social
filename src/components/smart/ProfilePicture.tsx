/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { minidenticon } from "minidenticons";
import toast from "react-hot-toast";

import {
  useUserData,
  useUploadFile,
  useUserProfileByAddress,
  useUpdateUserPhoto,
} from "@/lib/hooks";

const MAX_FILE_SIZE = 1 * 1024 * 1024;

interface IProfilePicture {
  userAddress: string;
  isEditable?: boolean;
}

export default function ProfilePicture({
  userAddress,
  isEditable,
}: IProfilePicture) {
  const { user } = useUserData();
  const { userProfile, userUID } = useUserProfileByAddress(userAddress);
  const { uploadFile, uploading } = useUploadFile();
  const { updateUserPhoto } = useUpdateUserPhoto();

  const [image, setImage] = useState<string | null>(
    userProfile?.photoURL || null
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setImage((userProfile?.photoURL as string) || null);
  }, [userProfile?.photoURL]);

  const canEdit = useMemo(
    () => Boolean(isEditable && user?.uid && userUID && user.uid === userUID),
    [isEditable, user?.uid, userUID]
  );

  const isValidFileType = (fileType: string) =>
    ["image/jpeg", "image/png"].includes(fileType);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidFileType(file.type) || file.size > MAX_FILE_SIZE) {
      toast.error("Invalid file type or size");
      return;
    }

    if (!canEdit || !userUID) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      setImage(reader.result as string);
      setSaving(true);
      try {
        const path = `profilePictures/${userUID}/${
          userProfile?.username || "user"
        }`;
        const url = await uploadFile(file, path);
        if (!url) {
          toast.error("Error getting URL");
          return;
        }
        await updateUserPhoto(userUID, url);
        toast.success("Profile picture updated successfully");
      } catch {
        toast.error("Error updating profile picture");
      } finally {
        setSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const busy = uploading || saving;

  return (
    <div data-testid="profile-picture-container">
      <label
        htmlFor="profilePictureInput"
        className={canEdit ? "cursor-pointer" : "cursor-default"}
      >
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
            className={
              canEdit
                ? "w-[50px] h-[50px] rounded-full object-cover cursor-pointer"
                : "w-[50px] h-[50px] rounded-full object-cover"
            }
            data-testid="uploaded-profile-picture"
          />
        )}
      </label>

      {canEdit && (
        <input
          id="profilePictureInput"
          type="file"
          onChange={handleChange}
          style={{ display: "none" }}
          accept="image/jpeg,image/png"
          data-testid="file-input"
        />
      )}

      {busy && <p data-testid="loading-text">Loading...</p>}
    </div>
  );
}
