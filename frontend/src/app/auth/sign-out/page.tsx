'use client';

import { FC, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import useUserInfo from '@/hook/useUserInfo';

const SignOut: FC = () => {
  const { cleanupUserInfo } = useUserInfo();

  useEffect(() => {
    // clean up user info cache
    void cleanupUserInfo();

    // sign out
    void signOut({
      redirect: false,
      callbackUrl: '/',
    });
  }, []);

  return null;
};

export default SignOut;
