'use client';

import { FC } from 'react';
import { audioTypes } from '@/types/option';
import VoiceSelection from '@/components/VoiceDrawdonSelection';
import LanguageSelection from '@/components/LanguageDrawdownSelection';
import ToggleSelection from '@/components/SingleSelection';
import Image from 'next/image';
import './custom.css';
import useUserInfo from '@/hook/useUserInfo';

const Option: FC<{
  handleOpenSetting: () => void;
}> = ({ handleOpenSetting }) => {
  const { user, updateLanguage, updateVoice } = useUserInfo();

  return (
    <div className="flex flex-col p-4 gap-1 w-full h-full bg-pink-100 rounded-2xl overflow-y-auto">
      <Image
        className="block select-none mx-auto mt-0"
        src="/logo-icon.png"
        alt="Logo"
        width={60}
        height={60}
        priority
      />

      <button
        onClick={handleOpenSetting}
        className="absolute px-3 rounded-md hover:bg-gray-50 top-4 left-6 text-xl w-fit select-none hover:cursor-pointer active:scale-95 origin-left transition-transform duration-200"
      >
        🏠 Home
      </button>
      <div className="flex justify-center w-full">
        <div className="flex flex-col w-7/8 gap-4 ">
          <VoiceSelection initVoice={user?.voice} updateVoice={updateVoice} />
          <LanguageSelection
            initLanguage={user?.language}
            updateLanguage={updateLanguage}
          />
          <ToggleSelection
            label="Audio Type"
            attribute="audio_type"
            options={audioTypes}
          />
          <ToggleSelection
            label="Reply Audio Type"
            attribute="reply_audio_type"
            options={audioTypes}
          />
        </div>
      </div>
    </div>
  );
};

export default Option;
