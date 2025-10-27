'use client';

import { FC, Suspense } from 'react';
import AiChat from './AiChat';
import ChatHistory from './ChatHistory';
import Option from './Option';

const TestChat: FC = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <div className="flex flex-wrap gap-4 p-4">
      <AiChat />
      <ChatHistory />
      <Option />
    </div>
  </Suspense>
);

export default TestChat;
