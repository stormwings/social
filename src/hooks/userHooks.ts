import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  doc,
  onSnapshot,
  DocumentData,
  Timestamp,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { auth, db } from "@/lib/firebase";
import { userService } from "@/services";
import { logger } from "@/lib/logger";

export function useUserData(customId: string | null = null) {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [username, setUsername] = useState(null);
  const [ethereumAddress, setEthereumAddress] = useState(null);
  const [userProfile, setUserProfile] = useState<DocumentData | null>(null);
  const [subjectEthereumAddress, setSubjectEthereumAddress] = useState<
    string | null
  >(null);

  useEffect(() => {
    let unsubscribe: any;

    if (user) {
      const ref = doc(db, "users", customId ? customId : user.uid);
      unsubscribe = onSnapshot(
        ref,
        (docSnapshot) => {
          setUserData(docSnapshot.data() || {});
          setUsername(docSnapshot.data()?.username);
          setEthereumAddress(docSnapshot.data()?.ethereumAddress);
          setUserProfile(docSnapshot.data() || null);
          setSubjectEthereumAddress(docSnapshot.data()?.ethereumAddress);
        },
        (error) => {
          logger.error("Error listening to user data", error, { uid: user.uid });
          toast.error("Failed to load user data");
        }
      );
    } else {
      setUsername(null);
      setEthereumAddress(null);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, customId]);

  return {
    userData,
    user,
    username,
    ethereumAddress,
    userProfile,
    subjectEthereumAddress,
  };
}

export const useUserPosts = (user: any) => {
  const [posts, setPosts] = useState<DocumentData[] | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) return;

      try {
        const postData = await userService.getUserPosts(user.uid);
        setPosts(postData);
      } catch (error) {
        logger.error("Error fetching user posts", error, { uid: user?.uid });
        toast.error("Failed to load user posts");
      }
    };

    fetchPosts();
  }, [user]);

  return posts;
};

// (pending) analizar refactor.
// .forEach no es necesario probablemente, entender por que se usaría
export function useUserProfileByUsername(subjectUsername: string | null) {
  const [userProfile, setUserProfile] = useState<DocumentData | null>(null);
  const [userUID, setUserUID] = useState<string | null>(null);
  const [subjectEthereumAddress, setSubjectEthereumAddress] = useState<
    string | null
  >(null);

  useEffect(() => {
    async function fetchUserProfile() {
      if (!subjectUsername) return;

      try {
        const result = await userService.getUserByUsername(subjectUsername);
        if (result) {
          setUserUID(result.uid);
          setUserProfile(result.profile);
          setSubjectEthereumAddress(result.profile.ethereumAddress);
        } else {
          setUserUID(null);
          setUserProfile(null);
          setSubjectEthereumAddress(null);
        }
      } catch (error) {
        logger.error("Error fetching user profile by username", error, { subjectUsername });
        toast.error("Failed to load user profile");
      }
    }
    fetchUserProfile();
  }, [subjectUsername]);

  return { userProfile, userUID, subjectEthereumAddress };
}

export function useUserProfileByUid(subjectUID: string) {
  const [userProfile, setUserProfile] = useState<DocumentData | null>(null);
  const [userEthereumAddress, setEthereumAddress] = useState<string | null>(
    null
  );

  useEffect(() => {
    async function fetchUserProfile() {
      if (!subjectUID) return;

      try {
        const profile = await userService.getUserByUid(subjectUID);
        if (profile) {
          setUserProfile(profile);
          setEthereumAddress(profile.ethereumAddress);
        }
      } catch (error) {
        logger.error("Error fetching user profile by UID", error, { subjectUID });
        toast.error("Failed to load user profile");
      }
    }

    fetchUserProfile();
  }, [subjectUID]);

  return { userProfile, userEthereumAddress };
}

export const useUserKeys = (user: any) => {
  const [userKeys, setUserKeys] = useState<string[]>([]);

  useEffect(() => {
    async function fetchUserKeys() {
      if (user) {
        try {
          const keys = await userService.getUserKeys(user.uid);
          setUserKeys(keys);
        } catch (error) {
          logger.error("Error fetching user keys", error, { uid: user?.uid });
          toast.error("Failed to load user keys");
        }
      }
    }
    fetchUserKeys();
  }, [user]);

  return userKeys;
};

type User = {
  id: string;
  username: string;
  ethereumAddress: string;
  holders: number;
  displayName: string;
  photoURL: string;
  createdAt: Timestamp;
};

type UseUsersDataConfigType = {
  sortType?: "newest" | "top";
};

export const useUsersData = ({
  sortType = "newest",
}: UseUsersDataConfigType) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function fetchAllUsers() {
      try {
        const sortBy = sortType === "newest" ? "createdAt" : "holders";
        const fetchedUsers = await userService.getUsers(sortBy, "desc", 100);
        setUsers(fetchedUsers as User[]);
      } catch (error) {
        logger.error("Error fetching users", error, { sortType });
        toast.error("Failed to load users");
      }
    }
    fetchAllUsers();
  }, [sortType]);

  return users;
};

export function useUserProfileAndPostsByUsername(subjectUsername: string | null) {
  const [userProfile, setUserProfile] = useState<DocumentData | null>(null);
  const [userUID, setUserUID] = useState<string | null>(null);
  const [posts, setPosts] = useState<DocumentData[] | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!subjectUsername) return;
      setLoadingProfile(true);
      try {
        const result = await userService.getUserByUsername(subjectUsername);
        if (result && !cancelled) {
          setUserUID(result.uid);
          setUserProfile(result.profile);
        } else if (!cancelled) {
          setUserUID(null);
          setUserProfile(null);
        }
      } catch (error) {
        logger.error("Error fetching user profile", error, { subjectUsername });
        toast.error("Failed to load user profile");
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    })();
    return () => { cancelled = true; };
  }, [subjectUsername]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!userUID || posts !== null) return;
      setLoadingPosts(true);
      try {
        const data = await userService.getUserPosts(userUID);
        if (!cancelled) setPosts(data);
      } catch (error) {
        logger.error("Error fetching user posts", error, { userUID });
        toast.error("Failed to load user posts");
      } finally {
        if (!cancelled) setLoadingPosts(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userUID, posts]);

  return { userProfile, userUID, posts, loadingProfile, loadingPosts };
}

export function useUserProfileByAddress(subjectAddress: string | null) {
  const [userProfile, setUserProfile] = useState<DocumentData | null>(null);
  const [userUID, setUserUID] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!subjectAddress) {
        setUserUID(null);
        setUserProfile(null);
        return;
      }
      try {
        const result = await userService.getUserByAddress(subjectAddress);
        if (!cancelled) {
          if (result) {
            setUserUID(result.uid);
            setUserProfile(result.profile);
          } else {
            setUserUID(null);
            setUserProfile(null);
          }
        }
      } catch (error) {
        console.error("Error fetching user by address:", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [subjectAddress]);

  return { userProfile, userUID };
}

export function useUpdateUserPhoto() {
  const updateUserPhoto = async (uid: string, photoURL: string) => {
    try {
      await userService.updateUserPhoto(uid, photoURL);
    } catch (error) {
      console.error("Error updating user photo:", error);
      throw error;
    }
  };
  return { updateUserPhoto };
}
