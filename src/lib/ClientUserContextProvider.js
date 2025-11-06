"use client"

import { UserContext } from './context';
import { useUserData } from '../lib/hooks';

export default function ClientUserContextProvider(props) {
    const { children, session } = props;
    const userData = useUserData();

    return (
      <UserContext.Provider value={userData}>
        {children}
      </UserContext.Provider>
    );
}
