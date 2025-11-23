import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { db } from "@/lib/firebase";
import { authService } from "@/services";
import { logger } from "@/lib/logger";

export function useSubmitUsername(user: any | null, userWallet: string | null) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submitUsername = async (username: string) => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = userWallet 
        ? await authService.createUserWithExistingWallet(username, userWallet, token)
        : await authService.createUserWithGeneratedWallet(username, token);

      if (response.status === 200) {
        toast.success("Account created successfully!");
        router.push("/deposit");
      } else if (response.status === 201) {
        toast.success("Welcome back!");
        router.push("/private/home");
      }
    } catch (error) {
      logger.error("Error setting up username", error, { username });
      if (error instanceof Error) {
        toast.error(error.message || "Failed to create username");
      } else {
        toast.error("Failed to create username");
      }
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
      try {
        const ref = doc(db, `usernames/${formValue}`);
        const docSnap = await getDoc(ref);
        setIsValid(!docSnap.exists());
      } catch (error) {
        logger.error("Failed to validate username", error, { username: formValue });
        setIsValid(false);
        toast.error("Failed to validate username");
      } finally {
        setLoading(false);
      }
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
      await authService.signInWithGoogle();
      toast.success("Signed in with Google successfully!");
    } catch (error) {
      logger.error("Error signing in with Google", error);
      toast.error("Failed to sign in with Google");
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
      const { address } = await authService.signInWithWallet();
      saveUserWallet(address);
      toast.success("Wallet connected successfully!");
    } catch (error) {
      logger.error("Error signing in with wallet", error);
      // Don't show toast here as authService already handles it
    } finally {
      setLoading(false);
    }
  };

  return { signInWithWallet, loading };
}
