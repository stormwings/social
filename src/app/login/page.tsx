"use client";

import { useContext, useEffect, useState } from "react";
import { UserContext, UserContextType } from "@/lib/context";
import { useRouter } from "next/navigation";
import { WalletIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import googleImg from "../../public/google.png";
import { getAuth } from "firebase/auth";

import {
  useSignInWithWallet,
  useSignInWithGoogle,
  useUsernameValidation,
  useSubmitUsername,
} from "@/lib/hooks";

const SignInWalletButton = ({
  saveUserWallet,
}: {
  saveUserWallet: Function;
}) => {
  const { signInWithWallet } = useSignInWithWallet();

  return (
    <button
      className="text-primary font-bold py-3 px-6 rounded-md text-center border border-primary flex items-center justify-center"
      onClick={() => signInWithWallet(saveUserWallet)}
    >
      <WalletIcon width={24} height={24} className="h-5 w-5 text-primary" />
      <span className="pl-2">Sign in with Wallet</span>
    </button>
  );
};

const SignInButton = () => {
  const { signInWithGoogle } = useSignInWithGoogle();

  return (
    <button
      className="text-primary font-bold py-3 px-6 rounded-md text-center border border-primary flex items-center justify-center"
      onClick={signInWithGoogle}
    >
      <Image
        src={googleImg}
        alt="Google Logo"
        width={20}
        height={20}
        className="mr-2"
      />
      <span>Sign in with Google</span>
    </button>
  );
};

export default function Enter() {
  const { user, username } = useContext(UserContext) as UserContextType;
  const [userWallet, setUserWallet] = useState(null);
  const router = useRouter();

  const auth = getAuth();
  auth.useDeviceLanguage();

  useEffect(() => {
    if (router && user && username) {
      router.push("/private/home");
    }
  }, [user, username, router]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="w-full flex flex-col items-center space-y-4 pb-8 mt-32">
        {user ? (
          !username ? (
            <UsernameForm userWallet={userWallet} />
          ) : null
        ) : (
          <>
            <SignInWalletButton saveUserWallet={setUserWallet} />
            <SignInButton />
          </>
        )}
      </div>
    </div>
  );
}

const UsernameForm = ({ userWallet }: { userWallet: any }) => {
  const { user, username } = useContext(UserContext) as UserContextType;
  const { formValue, isValid, loading, handleChange } = useUsernameValidation();
  const { submitUsername } = useSubmitUsername(user, userWallet);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await submitUsername(formValue);
  };

  return !username ? (
    <>
      <h3 className="text-primary text-2xl font-semibold mb-4">
        Choose Your Unique Identity
      </h3>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          name="username"
          placeholder="Username"
          value={formValue}
          onChange={handleChange}
          className="p-2 w-full border border-gray-300 rounded-lg bg-white"
        />
        <UsernameMessage
          username={formValue}
          isValid={isValid}
          loading={loading}
        />
        <button
          type="submit"
          className="bg-primary text-black px-4 py-2 rounded disabled:opacity-50 w-full"
          disabled={!isValid || loading}
        >
          {loading ? "Processing..." : "Confirm"}
        </button>
      </form>
    </>
  ) : null;
};

const UsernameMessage = ({
  username,
  isValid,
  loading,
}: {
  username: string;
  isValid: boolean;
  loading: boolean;
}) => {
  if (loading) return <p className="text-yellow-500 mb-2">Verifying...</p>;

  if (isValid)
    return <p className="text-green-500 mb-2">{username} is available!</p>;

  if (username && !isValid)
    return <p className="text-red-500 mb-2">{username} is not available</p>;

  return null;
};
