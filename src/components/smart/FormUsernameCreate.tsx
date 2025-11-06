"use client";

import React, { useCallback, useContext, useMemo } from "react";
import { UserContext, UserContextType } from "@/lib/context";
import { Button } from "@/components/dumb/Button";
import { useUsernameValidation, useSubmitUsername } from "@/lib/hooks";

type Props = {
  userWallet: string | null;
};

function UsernameMessage({
  username,
  isValid,
  loading,
}: {
  username: string;
  isValid: boolean;
  loading: boolean;
}) {
  const text = useMemo(() => {
    if (loading) return "Verifying...";
    if (isValid) return `${username} is available!`;
    if (username && !isValid) return `${username} is not available`;
    return null;
  }, [loading, isValid, username]);

  if (!text) return null;

  const colorClass = loading
    ? "text-yellow-500"
    : isValid
    ? "text-green-500"
    : "text-red-500";

  return (
    <p className={`${colorClass} mb-2`} aria-live="polite" role="status">
      {text}
    </p>
  );
}

export default function FormUsernameCreate({ userWallet }: Props) {
  const { user, username } = useContext(UserContext) as UserContextType;
  const {
    formValue,
    isValid,
    loading: validating,
    handleChange,
  } = useUsernameValidation();
  const { submitUsername, loading: submitting } = useSubmitUsername(
    user,
    userWallet
  );

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!isValid || validating || submitting) return;
      await submitUsername(formValue);
    },
    [submitUsername, formValue, isValid, validating, submitting]
  );

  if (username) return null;

  return (
    <>
      <h3 className="text-primary text-2xl font-semibold mb-4">
        Choose Your Unique Identity
      </h3>
      <form onSubmit={onSubmit} className="space-y-4">
        <label htmlFor="username" className="sr-only">
          Username
        </label>
        <input
          id="username"
          name="username"
          placeholder="Username"
          value={formValue}
          onChange={handleChange}
          autoComplete="username"
          inputMode="text"
          className="p-2 w-full border border-gray-300 rounded-lg bg-white"
        />

        <UsernameMessage
          username={formValue}
          isValid={isValid}
          loading={validating}
        />

        <Button
          type="submit"
          fullWidth
          loading={submitting}
          disabled={!isValid || validating || submitting}
        >
          {submitting ? "Processing..." : "Confirm"}
        </Button>
      </form>
    </>
  );
}
