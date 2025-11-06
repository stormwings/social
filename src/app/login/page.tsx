"use client";

import { memo, useContext, useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { WalletIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { getAuth } from "firebase/auth";

import { Button } from "@/components/dumb/Button";
import FormUsernameCreate from "@/components/smart/FormUsernameCreate";

import { useSignInWithWallet, useSignInWithGoogle } from "@/lib/hooks";
import { UserContext, UserContextType } from "@/lib/context";

import googleImg from "./../../public/google.png";

type SaveUserWallet = (wallet: string | null) => void;

const ROUTES = { HOME: "/private/home" } as const;

const SignInWalletButton = memo(function SignInWalletButton({
  saveUserWallet,
}: {
  saveUserWallet: SaveUserWallet;
}) {
  const { signInWithWallet } = useSignInWithWallet();
  const onClick = useCallback(
    () => signInWithWallet(saveUserWallet),
    [signInWithWallet, saveUserWallet]
  );

  return (
    <Button
      variant="outline"
      leftIcon={<WalletIcon width={20} height={20} className="h-5 w-5" />}
      onClick={onClick}
      aria-label="Sign in with Ethereum wallet"
    >
      Sign in with Wallet
    </Button>
  );
});

const SignInGoogleButton = memo(function SignInGoogleButton() {
  const { signInWithGoogle } = useSignInWithGoogle();
  return (
    <Button
      variant="outline"
      leftIcon={
        <Image src={googleImg} alt="Google logo" width={20} height={20} />
      }
      onClick={signInWithGoogle}
      aria-label="Sign in with Google"
    >
      Sign in with Google
    </Button>
  );
});

export default function Enter() {
  const { user, username } = useContext(UserContext) as UserContextType;
  const [userWallet, setUserWallet] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    auth.useDeviceLanguage();
  }, []);

  useEffect(() => {
    if (user && username) {
      router.replace(ROUTES.HOME);
    }
  }, [user, username, router]);

  const shouldShowUsernameForm = !!user && !username;
  const shouldShowSignIn = !user;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="w-full flex flex-col items-center space-y-4 pb-8 mt-32">
        {shouldShowUsernameForm && (
          <FormUsernameCreate userWallet={userWallet} />
        )}
        {shouldShowSignIn && (
          <>
            <SignInWalletButton saveUserWallet={setUserWallet} />
            <SignInGoogleButton />
          </>
        )}
      </div>
    </div>
  );
}
