import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { authService } from "@/services";

export function useSubmitUsername(user: any | null, userWallet: string | null) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submitUsername = async (username: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = userWallet 
        ? await authService.createUserWithExistingWallet(username, userWallet, token)
        : await authService.createUserWithGeneratedWallet(username, token);

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
      await authService.signInWithGoogle();
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
      const { address } = await authService.signInWithWallet();
      saveUserWallet(address);
    } catch (error) {
      console.error("error signing in with wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  return { signInWithWallet, loading };
}
