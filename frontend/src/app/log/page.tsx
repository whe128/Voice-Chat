'use client';

import { FC } from 'react';
import SetOpenLog from '@/components/SetOpenLog';

const Log: FC = () => (
  <div className="relative flex h-dvh w-full max-w-lg mx-auto justify-center items-center">
    <div className="absolute w-full h-full top-0 right-0">
      <SetOpenLog />
    </div>
  </div>
);

export default Log;
