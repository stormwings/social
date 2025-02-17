import Link from "next/link";
import { ReactNode } from "react";
import { useUserData } from "@/lib/hooks";

interface IAuthCheckProps {
  children?: ReactNode;
  fallback?: ReactNode;
}

export default function AuthCheck({ children, fallback }: IAuthCheckProps) {
  const { username } = useUserData();

  if (username) {
    return <>{children}</>;
  }

  return fallback || (
    <Link href="/login" data-testid="auth-check-login">
      You must be signed in
    </Link>
  );
}