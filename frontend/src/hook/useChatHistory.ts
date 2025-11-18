import {
  useQuery,
  QueryObserverResult,
  useQueryClient,
} from '@tanstack/react-query';
import apiTextHistory from '@/api/textHistory';
import { ChatMessage } from '@/types/message';
import { useSession } from 'next-auth/react';

const useChatHistory = (
  getWebSocket: (() => Promise<WebSocket>) | null,
): {
  chatMessages: ChatMessage[];
  isLoading: boolean;
  error: Error | null;
  handleGetChatHistory: () => Promise<
    QueryObserverResult<ChatMessage[], Error>
  >;
  addMessage: (msg: ChatMessage, targetId?: string) => void;
  updateGrammarCheck: (id: string, grammarError: string) => void;
  updateMessageText: (id: string, text: string) => void;
  updateHasGrammarCheck: (id: string, hasGrammarCheck: boolean) => void;
  deleteMessage: (id: string) => void;
} => {
  const queryClient = useQueryClient();

  const { data: session } = useSession();
  const userEmail = session?.user.email;

  const {
    data: chatMessages,
    isLoading,
    error,
    refetch,
  } = useQuery<ChatMessage[]>({
    queryKey: ['chatHistory'],
    queryFn: async () => {
      // do not fetch for guest user
      if (userEmail && userEmail === 'guest') {
        return [] as ChatMessage[];
      }

      const ws = getWebSocket ? await getWebSocket() : null;

      const { chatMessages: apiChatMessages, error: responseError } =
        await apiTextHistory(ws);
      if (responseError) {
        throw new Error(`Fail to get chat history: ${responseError}`);
      }

      return apiChatMessages;
    },
    // not fetch automatically
    initialData: [],
    enabled: false,
  });

  const addMessage = (msg: ChatMessage, targetId?: string): void => {

    queryClient.setQueryData<ChatMessage[]>(['chatHistory'], (oldData = []) => {
      if (!targetId) {
        return [...oldData, msg];
      }

      // insert after the message with targetId
      const index = oldData.findIndex((m) => m.id === targetId);
      if (index === -1) {
        return [...oldData, msg];
      }

      return [...oldData.slice(0, index + 1), msg, ...oldData.slice(index + 1)];
    });
  };

  const updateGrammarCheck = (id: string, grammarError: string): void => {
    queryClient.setQueryData<ChatMessage[]>(['chatHistory'], (oldData = []) =>
      oldData.map((msg) => {
        if (msg.id === id) {
          return { ...msg, grammarError, grammarHasChecked: true };
        }

        return msg;
      }),
    );
  };

  const updateMessageText = (id: string, text: string): void => {
    queryClient.setQueryData<ChatMessage[]>(['chatHistory'], (oldData = []) =>
      oldData.map((msg) => {
        if (msg.id === id && msg.text !== text) {
          return { ...msg, text };
        }

        return msg;
      }),
    );
  };

  const updateHasGrammarCheck = (
    id: string,
    hasGrammarCheck: boolean,
  ): void => {
    queryClient.setQueryData<ChatMessage[]>(['chatHistory'], (oldData = []) =>
      oldData.map((msg) => {
        if (msg.id === id && msg.hasGrammarCheck !== hasGrammarCheck) {
          return { ...msg, hasGrammarCheck };
        }

        return msg;
      }),
    );
  };

  const deleteMessage = (id: string): void => {
    queryClient.setQueryData<ChatMessage[]>(['chatHistory'], (oldData = []) =>
      oldData.filter((msg) => msg.id !== id),
    );
  };

  return {
    chatMessages,
    isLoading,
    error: error ?? null,
    handleGetChatHistory: refetch,
    addMessage,
    updateGrammarCheck,
    updateMessageText,
    updateHasGrammarCheck,
    deleteMessage,
  };
};

export default useChatHistory;
