'use client';

import { FC, useState } from 'react';
import SetOpenLog from '@/components/SetOpenLog';

const Log: FC = () => {
  const [showOption, setShowOption] = useState(true);
  const toggleShowOption = (): void => {
    setShowOption(!showOption);
  };

  return (
    <div className="relative flex h-dvh w-full max-w-lg mx-auto justify-center items-center">
      <div className="absolute w-full h-full top-0 right-0">
        <SetOpenLog handleOpenSetting={toggleShowOption} />
      </div>
    </div>
  );
};

export default Log;
