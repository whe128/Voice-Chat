import React, { createContext, useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { logger } from '@/utils/logger';

interface TempKeyResponse {
  tempKey: string;
  expire: string;
}

interface IWebSocketContext {
  ws: WebSocket | null;
  sendMessage: (message: string) => void;
  sendBinary: (data: ArrayBuffer) => void;
}

export const WebSocketContext = createContext<IWebSocketContext | null>(null);

interface WebSocketProviderProps {
  children: React.ReactNode;
}

const wsQueue: {
  expectedCount: number;
  messages: (string | Blob)[];
  resolve: (data: (string | Blob)[]) => void;
  reject: (err: Error) => void;
}[] = [];

export const waitForResponse = (
  ws: WebSocket | null,
  receiveNumber: number,
): Promise<(string | Blob)[]> =>
  new Promise((resolve, reject) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return reject(new Error('WebSocket is not open'));
    }

    wsQueue.push({
      expectedCount: receiveNumber,
      messages: [],
      resolve,
      reject,
    });
  });

const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  // will not render
  const wsRef = useRef<WebSocket | null>(null);

  const router = useRouter();
  const [connected, setConnected] = React.useState(false);
  const pathname = usePathname(); // current path
  const isConnectingRef = useRef(false);
  const { data: session } = useSession();
  const userId = session?.user.id;
  const userEmail = session?.user.email;
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  const setupWebSocket = async (): Promise<void> => {
    try {
      const hostUrl = process.env.NEXT_PUBLIC_BACKEND_ACCESS_URL;
      const accessKey = process.env.NEXT_PUBLIC_BACKEND_ACCESS_KEY;

      const res = await fetch(`${hostUrl}/api/connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accessKey': accessKey ?? '',
        },
      });

      if (!res.ok) {
        throw new Error(`Fail to get tempKey: ${res.statusText}`);
      }

      const tempKeyObj = (await res.json()) as TempKeyResponse;

      const baseWsUrl = hostUrl?.replace('http', 'ws').replace('https', 'wss');
      const params = new URLSearchParams({
        user_id: userId ?? '',
        user_email: userEmail ?? '',
        connection_token: tempKeyObj.tempKey,
      });

      const wsURL = `${baseWsUrl}/ws?${params.toString()}`;

      const ws = new WebSocket(wsURL);

      ws.onopen = (): void => {
        logger.log('✅ WebSocket connected');
        wsRef.current = ws;
        setConnected(true);
        isConnectingRef.current = false;
      };

      ws.onclose = (): void => {
        logger.log('❌ WebSocket Connection closed');
      };

      ws.onerror = (error): void => {
        logger.error('❌ WebSocket error:', error);
        setConnected(false);
        isConnectingRef.current = false;
      };

      const handleMessage = (event: MessageEvent): void => {
        logger.log('Received message:', event.data);

        const task = wsQueue[0];

        // append message to the current task
        task.messages.push(event.data as string | Blob);

        // check if received enough messages
        if (task.messages.length >= task.expectedCount) {
          task.resolve(task.messages);
          wsQueue.shift();
        }
      };

      const handleClose = (): void => {
        ws.removeEventListener('message', handleMessage);
        ws.removeEventListener('close', handleClose);
        wsQueue.forEach((task) => {
          task.reject(
            new Error('WebSocket closed before receiving all messages'),
          );
        });
      };

      ws.addEventListener('message', handleMessage);
      ws.addEventListener('close', handleClose);
    } catch (error) {
      logger.error('Error setting up WebSocket:', error);
    }
  };

  useEffect(() => {
    // only setup WebSocket for /test path
    // no setup no cleanup
    if (pathname !== '/chat') {
      // cleanup existing connection if exists
      wsRef.current?.close();
      wsRef.current = null;
      setConnected(false);
      isConnectingRef.current = false;

      return;
    }

    // register for closing websocket when unload by closing browser
    const handleBeforeUnload = (): void => {
      wsRef.current?.close();
      wsRef.current = null;
      setConnected(false);
      isConnectingRef.current = false;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // setup WebSocket connection
    if (!wsRef.current && !isConnectingRef.current) {
      isConnectingRef.current = true;
      void setupWebSocket();

      const timeout = setTimeout(() => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          logger.warn('⏰ WebSocket connection timeout, redirecting...');
          router.replace(query ? `/auth/sign-out?${query}` : `/auth/sign-out`);
        }
      }, 10000); // 10 seconds timeout

      return (): void => clearTimeout(timeout);
    }

    return (): void => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      wsRef.current?.close();
      wsRef.current = null;
      setConnected(false);
      isConnectingRef.current = false;
    };
  }, [pathname]);

  if (pathname && !pathname.startsWith('/chat')) {
    return children;
  }

  if (!connected) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-gray-600 text-lg font-medium">
            Connecting...
          </span>
        </div>
      </div>
    );
  }

  return (
    <WebSocketContext.Provider
      value={{
        ws: wsRef.current,
        sendMessage: (msg: string) => wsRef.current?.send(msg),
        sendBinary: (data: ArrayBuffer) => wsRef.current?.send(data),
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;
