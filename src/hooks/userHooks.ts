import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  doc,
  onSnapshot,
  DocumentData,
  collection,
  query,
  where,
  orderBy,
  getDoc,
  getDocs,
  Timestamp,
  updateDoc,
  limit,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

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
      unsubscribe = onSnapshot(ref, (docSnapshot) => {
        setUserData(docSnapshot.data() || {});
        setUsername(docSnapshot.data()?.username);
        setEthereumAddress(docSnapshot.data()?.ethereumAddress);
        setUserProfile(docSnapshot.data() || null);
        setSubjectEthereumAddress(docSnapshot.data()?.ethereumAddress);
      });
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

      const postsRef = collection(db, "users", user.uid, "posts");
      const q = query(postsRef, orderBy("createdAt"));

      const querySnapshot = await getDocs(q);
      const postData = querySnapshot.docs.map((doc) => ({
        postId: doc.id,
        ...doc.data(),
      }));
      setPosts(postData);
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

      const usersRef = query(
        collection(db, "users"),
        where("username", "==", subjectUsername)
      );
      const userSnapshot = await getDocs(usersRef);
      userSnapshot.forEach((doc) => {
        setUserUID(doc.id);
        setUserProfile(doc.data());
        setSubjectEthereumAddress(doc.data().ethereumAddress);
      });
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

      const userDocRef = doc(db, "users", subjectUID);
      const userSnapshot = await getDoc(userDocRef);

      if (userSnapshot.exists()) {
        setUserProfile(userSnapshot.data());
        setEthereumAddress(userSnapshot.data().ethereumAddress);
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
        const keysRef = collection(db, "users", user.uid, "keys");
        const querySnapshot = await getDocs(keysRef);
        const keys = querySnapshot.docs.map((doc) => doc.id);
        setUserKeys(keys);
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
      const usersRef = collection(db, "users");
      const fieldToSort = sortType === "newest" ? "createdAt" : "holders";
      const querySnapshot = await getDocs(
        query(usersRef, orderBy(fieldToSort, "desc"), limit(100))
      );
      const fetchedUsers = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as User)
      );
      setUsers(fetchedUsers);
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
        const usersRef = query(collection(db, "users"), where("username", "==", subjectUsername));
        const userSnapshot = await getDocs(usersRef);
        const doc0 = userSnapshot.docs[0];
        if (doc0 && !cancelled) {
          setUserUID(doc0.id);
          setUserProfile(doc0.data());
        } else if (!cancelled) {
          setUserUID(null);
          setUserProfile(null);
        }
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
        const postsRef = collection(db, "users", userUID, "posts");
        const q = query(postsRef, orderBy("createdAt"));
        const qs = await getDocs(q);
        const data = qs.docs.map(d => ({ ...d.data(), postId: d.id }));
        if (!cancelled) setPosts(data);
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
      const usersRef = query(
        collection(db, "users"),
        where("ethereumAddress", "==", subjectAddress)
      );
      const snap = await getDocs(usersRef);
      const d0 = snap.docs[0];
      if (!cancelled) {
        if (d0) {
          setUserUID(d0.id);
          setUserProfile(d0.data());
        } else {
          setUserUID(null);
          setUserProfile(null);
        }
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
    await updateDoc(doc(db, "users", uid), { photoURL });
  };
  return { updateUserPhoto };
}
