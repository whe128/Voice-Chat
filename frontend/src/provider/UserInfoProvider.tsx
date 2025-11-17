'use client';

import { FC, ReactNode, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import useUserInfo from '@/hook/useUserInfo';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { logger } from '@/utils/logger';

const needUserInfoPaths = ['/chat'];

interface Props {
  children: ReactNode;
}

const UseInfoProvider: FC<Props> = ({ children }) => {
  const getUserInfoIdRef = useRef<string | null>(null);
  const { data: session, status } = useSession();
  const userId = session?.user.id;
  const { user, isLoading, error, handleGetUserInfo } = useUserInfo(userId);
  const pathname = usePathname();
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  // fetch user info on mount or when session changes
  useEffect(() => {
    const fetchWithTimeout = async (): Promise<void> => {
      try {
        timeoutRef.current = setTimeout(() => {
          alert('Timeout to fetch UserInfo, please Refresh.');
          router.replace(query ? `/auth/sign-out?${query}` : `/auth/sign-out`);
        }, 10000);

        await handleGetUserInfo();
      } catch (err) {
        logger.error(err);
        router.replace(query ? `/auth/sign-out?${query}` : `/auth/sign-out`);
      } finally {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    };

    if (
      userId &&
      status === 'authenticated' &&
      needUserInfoPaths.includes(pathname) &&
      getUserInfoIdRef.current !== userId
    ) {
      getUserInfoIdRef.current = userId;

      void fetchWithTimeout();
    }
  }, [session, pathname]);

  useEffect(() => {
    if (!error || !needUserInfoPaths.includes(pathname)) {
      return;
    }
    // redirect to sign-out on error, to clear the session
    router.replace(query ? `/auth/sign-out?${query}` : `/auth/sign-out`);
    alert(`[Error]:\n${error.message}\nPlease login again`);
  }, [error]);

  if (!needUserInfoPaths.includes(pathname)) {
    return children;
  }

  if ((isLoading || !user) && !error) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-5 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-gray-600 text-lg font-medium">
            Getting User Profile...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  return children;
};

export default UseInfoProvider;
