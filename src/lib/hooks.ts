import { useEffect, useState, useMemo } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  doc,
  onSnapshot,
  DocumentData,
  QueryDocumentSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  setDoc,
  DocumentReference,
  writeBatch,
  increment,
} from "firebase/firestore";
import { useDocument } from "react-firebase-hooks/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { auth, db } from "./firebase";
import {
  usersKeysAddress,
  RPC_ENDPOINT,
  usdtAddress as USDT_CONTRACT_ADDRESS,
} from "@/lib/dappParams";
import usersKeysAbi from "./../usersKeysAbi";
import { googleAuthProvider } from "@/lib/firebase";
import { signInWithCustomToken } from "firebase/auth";
import {
  collection,
  collectionGroup,
  query,
  where,
  orderBy,
  limit,
  getDoc,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { cutString } from "./utils";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";

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

type Trade = {
  uid: string;
};

type UseTradesConfigType = {
  user: any;
  userKeys: string[];
  initialFilter: string;
};

export const useTrades = ({
  user,
  userKeys,
  initialFilter,
}: UseTradesConfigType) => {
  const [filter, setFilter] = useState<string>(initialFilter);
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    if (userKeys.length > 0 && user) {
      let q;
      const tradesRef = collection(db, "trades");

      switch (filter) {
        case "userKeys":
          if (userKeys.length === 0) return;
          q = query(
            tradesRef,
            where("subject", "in", userKeys),
            orderBy("timestamp", "desc")
          );
          break;
        case "yourKey":
          q = query(
            tradesRef,
            where("subject", "==", user.uid),
            orderBy("timestamp", "desc")
          );
          break;
        case "allTrades":
          q = query(tradesRef, orderBy("timestamp", "desc"));
          break;
        default:
          return;
      }

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const newTrades = querySnapshot.docs.map((doc) => doc.data() as Trade);
        setTrades(newTrades);
      });

      return () => unsubscribe();
    }
  }, [filter, userKeys, user]);

  return { trades, filter, setFilter };
};

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

export const useKeyCount = ({
  ethereumAddress,
  subjectEthereumAddress,
}: any) => {
  const [keyCount, setKeyCount] = useState(null);

  useEffect(() => {
    if (ethereumAddress && subjectEthereumAddress) {
      const fetchKeyCount = async () => {
        const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT);
        const usersKeysCContract = new ethers.Contract(
          usersKeysAddress,
          usersKeysAbi,
          provider
        );

        try {
          // I assume the `keysBalance` function gives the count of keys for a specific address
          // And let's also assume keysSubject is the address that represents the type of key.
          const userKeyCount = await usersKeysCContract.keysBalance(
            subjectEthereumAddress,
            ethereumAddress
          ); // Replace KEYS_SUBJECT_ADDRESS with actual address or logic
          setKeyCount(userKeyCount.toString()); // Convert BigNumber to string
        } catch (error) {
          console.error("Error fetching key count:", error);
        }
      };

      fetchKeyCount();
    }
  }, [ethereumAddress, subjectEthereumAddress]);

  return keyCount;
};

export const useBuyPrice = ({ ethereumAddress }: any) => {
  const [buyPrice, setBuyPrice] = useState<string | null>(null);

  useEffect(() => {
    if (!ethereumAddress) return;
    async function fetchBuyPrice() {
      const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT);
      const contract = new ethers.Contract(
        usersKeysAddress,
        usersKeysAbi,
        provider
      );

      try {
        const price = await contract.getBuyPrice(ethereumAddress, 1);
        setBuyPrice(ethers.formatEther(price)); // Convert Wei to Ether for display
      } catch (error) {
        setBuyPrice("- ");
        console.error("Error fetching buy price:", error);
      }
    }
    fetchBuyPrice();
  }, [ethereumAddress]);

  return buyPrice;
};

export const useUsdtBalance = ({ ethereumAddress }: any) => {
  const [usdtBalance, setUsdtBalance] = useState<string | null>(null);

  useEffect(() => {
    if (!ethereumAddress) return;
    let mounted = true;

    (async () => {
      const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT);
      const contract = new ethers.Contract(
        USDT_CONTRACT_ADDRESS,
        [
          "function balanceOf(address) view returns (uint256)",
          "function decimals() view returns (uint8)",
        ],
        provider
      );

      const dec = Number(await contract.decimals());
      const update = async () => {
        const raw = await contract.balanceOf(ethereumAddress);
        if (mounted) setUsdtBalance(ethers.formatUnits(raw, dec));
      };

      await update();
      const id = setInterval(update, 5000);
      return () => { mounted = false; clearInterval(id); };
    })();
  }, [ethereumAddress]);

  return usdtBalance;
};

export function useSubmitUsername(user: any | null, userWallet: string | null) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submitUsername = async (username: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await axios.post(
        userWallet ? "/api/setup/wallet" : "/api/setup",
        { username, address: userWallet },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        router.push("/deposit");
      } else if (response.status === 201) {
        router.push("/private/home");
      }
    } catch (error) {
      console.error("error setting up the username:", error);
    } finally {
      setLoading(false);
    }
  };

  return { submitUsername, loading };
}

export function useUsernameValidation(initialValue: string = "") {
  const [formValue, setFormValue] = useState(initialValue);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (formValue.length < 3) {
      setIsValid(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      const ref = doc(db, `usernames/${formValue}`);
      const docSnap = await getDoc(ref);
      setIsValid(!docSnap.exists());
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [formValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase();
    const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

    if (val.length < 3 || re.test(val)) {
      setFormValue(val);
    }
  };

  return { formValue, isValid, loading, handleChange };
}

export function useSignInWithGoogle() {
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error) {
      console.error("error signing in with google:", error);
    } finally {
      setLoading(false);
    }
  };

  return { signInWithGoogle, loading };
}

export function useSignInWithWallet() {
  const [loading, setLoading] = useState(false);

  const signInWithWallet = async (saveUserWallet: Function) => {
    setLoading(true);
    try {
      const message = "signin";
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);
      const address = await signer.getAddress();

      const response = await axios.post("/api/token", {
        address,
        signature,
        message,
      });

      await signInWithCustomToken(auth, response.data.token);
      saveUserWallet(address);
    } catch (error) {
      console.error("error signing in with wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  return { signInWithWallet, loading };
}
interface ChatData {
  id: string;
  lastUpdate?: any;
  messages: string[];
  participants: string[];
}

export function useUserChats(user: any) {
  const [userChats, setUserChats] = useState<ChatData[]>([]);

  useEffect(() => {
    async function fetchUserChats() {
      if (!user) return;

      const chatsQuery = query(
        collection(db, "chats"),
        where("participants", "array-contains", user.uid)
      );
      const querySnapshot = await getDocs(chatsQuery);

      const fetchedChats = querySnapshot.docs.map(transDocToObj);
      const sortedChats = sortChatsByLastUpdate(fetchedChats);

      setUserChats(sortedChats);
    }

    fetchUserChats();
  }, [user]);

  const transDocToObj = (doc: QueryDocumentSnapshot): ChatData => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      lastUpdate: data.lastUpdate ? data.lastUpdate.toDate() : null,
    } as ChatData;
  };

  const sortChatsByLastUpdate = (chats: ChatData[]): ChatData[] =>
    chats.sort((a, b) => (b.lastUpdate || 0) - (a.lastUpdate || 0));

  return userChats;
}

export function useChatMessages(chatId: string) {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (chatId) {
      const messagesRef = collection(db, "chats", chatId, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      });

      return () => unsubscribe();
    }
  }, [chatId]);

  return messages;
}

export function useChatParticipant(chatId: string, user: any) {
  const [participant, setParticipant] = useState<{
    username: string | null;
    address: string | null;
  }>({
    username: null,
    address: null,
  });

  useEffect(() => {
    async function fetchChatData() {
      if (!chatId || !user) return;

      const chatRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) return;

      const otherParticipant = chatDoc
        .data()
        .participants.find((participant: string) => participant !== user.uid);

      if (otherParticipant) {
        const userRef = doc(db, "users", otherParticipant);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setParticipant({
            username: userDoc.data().username,
            address: userDoc.data().ethereumAddress,
          });
        }
      }
    }

    fetchChatData();
  }, [chatId, user]);

  return participant;
}

export function useSendMessage(chatId: string, user: any) {
  const [newMessage, setNewMessage] = useState("");

  const sendMessage = async () => {
    if (newMessage.trim() !== "" && user) {
      const messagesRef = collection(db, "chats", chatId, "messages");
      const chatRef = doc(db, "chats", chatId);

      await addDoc(messagesRef, {
        text: newMessage,
        sender: user.uid,
        timestamp: serverTimestamp(),
        readed: false,
        readedTimestamp: null,
      });

      updateDoc(chatRef, {
        lastUpdate: serverTimestamp(),
        lastMessage: cutString(newMessage, 15),
      });

      setNewMessage("");
    }
  };

  return { newMessage, setNewMessage, sendMessage };
}

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
      const response = await axios.post("/api/withdraw", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(response.data.message);
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return { withdraw, isProcessing };
}

export const useSellPrice = (keyAddress: string, numberOfKeys: number) => {
  const [sellPrice, setSellPrice] = useState<string | null>(null);
  const [alert, setAlert] = useState("");

  useEffect(() => {
    async function fetchSellPrice() {
      try {
        const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT);
        const contract = new ethers.Contract(
          usersKeysAddress,
          usersKeysAbi,
          provider
        );

        const price = await contract.getSellPrice(keyAddress, numberOfKeys);
        setSellPrice(ethers.formatEther(price));
        setAlert("");
      } catch (error) {
        setAlert("No tienes suficientes keys para vender");
        console.error("Error fetching sell price:", error);
      }
    }

    fetchSellPrice();
  }, [keyAddress, numberOfKeys]);

  return { sellPrice, alert };
};

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