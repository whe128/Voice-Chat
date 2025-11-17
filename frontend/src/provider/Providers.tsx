'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type FC, ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import WebSocketProvider from '@/provider/WebSocketProvider';
import AuthGuardProvider from '@/provider/AuthGuardProvider';
import UseInfoProvider from './UserInfoProvider';

interface ProvidersProps {
  children: ReactNode;
}

const Providers: FC<ProvidersProps> = ({ children }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            enabled: false,
            refetchOnMount: false, // not refetch on mount
            refetchOnWindowFocus: false, // not refetch on window focus
          },
        },
      }),
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <AuthGuardProvider>
          <UseInfoProvider>
            <WebSocketProvider>{children}</WebSocketProvider>
          </UseInfoProvider>
        </AuthGuardProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
};

export default Providers;
