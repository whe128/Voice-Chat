'use client';

import { FC, Suspense, useState } from 'react';
import AiChat from '@/components/AiChat';
import Option from '@/components/Option';
import useUserInfo from '@/hook/useUserInfo';

const TestChat: FC = () => {
  const { user } = useUserInfo();

  const [showOption, setShowOption] = useState(!user?.language || !user.voice);

  const toggleShowOption = (): void => {
    setShowOption(!showOption);
  };

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center text-xl">
          Loading...
        </div>
      }
    >
      <div className="relative flex h-dvh w-full max-w-lg mx-auto justify-center items-center">
        <AiChat handleOpenSetting={toggleShowOption} />
        {showOption && (
          <div className="absolute w-full h-full top-0 right-0">
            <Option handleOpenSetting={toggleShowOption} />
          </div>
        )}
      </div>
    </Suspense>
  );
};

export default TestChat;
