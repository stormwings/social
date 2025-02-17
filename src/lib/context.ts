"use client"

import { createContext } from 'react';

import { User as FirebaseUser } from 'firebase/auth';

export type UserContextType = {
  user: FirebaseUser | null;
  username: string | null;
  ethereumAddress: string | null;
};

export const UserContext = createContext<UserContextType | null>(null);