import { FC, useEffect, useRef } from 'react';
import './custom.css';
import { ChatMessage } from '@/types/message';
import MessageBox, { MessageBoxSuspense } from './MessageBox';

export const ChatHistorySuspense: FC = () => (
  <div className="flex h-full flex-col gap-1 overflow-y-auto scrollbar-custom -mr-2">
    <MessageBoxSuspense />
    <MessageBoxSuspense />
    <MessageBoxSuspense />
  </div>
);

interface ChatHistoryProps {
  chatMessages?: ChatMessage[];
  hasGetChatHistory?: boolean;
}

const ChatHistory: FC<ChatHistoryProps> = ({
  chatMessages = [],
  hasGetChatHistory = false,
}: ChatHistoryProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const div = scrollRef.current;
    if (div) {
      div.scrollTop = div.scrollHeight;
    }
  }, [chatMessages]);

  return hasGetChatHistory ? (
    <div
      ref={scrollRef}
      className="flex flex-col h-full gap-2 py-1 overflow-y-auto scrollbar-custom -mr-2"
    >
      {chatMessages.map((msg: ChatMessage) => (
        <MessageBox
          key={msg.id}
          text={msg.text}
          isSendOut={msg.isSendOut}
          hasGrammarCheck={msg.hasGrammarCheck}
          grammarHasChecked={msg.grammarHasChecked}
          grammarError={msg.grammarError}
          autoRead={msg.autoRead}
        />
      ))}
    </div>
  ) : (
    <ChatHistorySuspense />
  );
};

export default ChatHistory;
