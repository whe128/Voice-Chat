'use client';

import { FC, ReactNode, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Props {
  children: ReactNode;
}

const authedAvailablePath = ['/auth/sign-out', '/chat', '/', '/log'];

const unAuthedAvailablePath = ['/auth/sign-in', '/auth/sign-up', '/log'];

const noNeedAuthCheckPaths = ['/log'];

const AuthenticationGuard: FC<Props> = ({ children }) => {
  const { status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const isUnauthenticated = status === 'unauthenticated';

  const shouldGoToChat =
    isAuthenticated && !authedAvailablePath.includes(pathname);
  const shouldGoToSignIn =
    isUnauthenticated && !unAuthedAvailablePath.includes(pathname);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    // authed can only access authedAvailablePath
    if (shouldGoToChat) {
      router.replace(query ? `/chat?${query}` : `/chat`);
    }

    // unauthed can only access unAuthedAvailablePath
    if (shouldGoToSignIn) {
      router.replace(query ? `/auth/sign-in?${query}` : `/auth/sign-in`);
    }
  }, [isLoading, pathname, shouldGoToChat, shouldGoToSignIn, router]);

  if (noNeedAuthCheckPaths.includes(pathname)) {
    return children;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-5 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-gray-600 text-lg font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (shouldGoToSignIn || shouldGoToChat) {
    return null;
  }

  return children;
};

export default AuthenticationGuard;
