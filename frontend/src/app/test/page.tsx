'use client';

import { FC } from 'react';
import AiChat from './AiChat';
import ChatHistory from './ChatHistory';
import Option from './Option';

const TestChat: FC = () => (
  <div className="flex flex-wrap gap-4 p-4">
    <AiChat />
    <ChatHistory />
    <Option />
  </div>
);

export default TestChat;
