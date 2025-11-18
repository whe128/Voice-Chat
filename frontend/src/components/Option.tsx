'use client';

import { FC, useEffect } from 'react';
import { audioTypes, sysLanguages, sysVoices } from '@/types/option';
import VoiceSelection from '@/components/VoiceDrawdonSelection';
import LanguageSelection from '@/components/LanguageDrawdownSelection';
import ToggleSelection from '@/components/SingleSelection';
import Image from 'next/image';
import './custom.css';
import useUserInfo from '@/hook/useUserInfo';
import { useRouter, useSearchParams } from 'next/navigation';

const Option: FC<{
  handleOpenSetting: () => void;
}> = ({ handleOpenSetting }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryLanguage = searchParams.get('language');
  const queryVoice = searchParams.get('voice');

  const { user, updateLanguage, updateVoice } = useUserInfo();

  const initialLanguage =
    user?.language ??
    (queryLanguage && sysLanguages.includes(queryLanguage)
      ? queryLanguage
      : sysLanguages[0]);

  const initialVoice =
    user?.voice ??
    (queryVoice && sysVoices.includes(queryVoice) ? queryVoice : sysVoices[0]);

  const showHomeButton = user?.language && user.voice;

  useEffect(() => {
    if (initialLanguage === queryLanguage && initialVoice === queryVoice) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    // synchronize query params with initial values
    if (queryLanguage && initialLanguage !== queryLanguage) {
      params.set('language', initialLanguage);
    }

    if (queryVoice && initialVoice !== queryVoice) {
      params.set('voice', initialVoice);
    }

    void router.replace(`?${params.toString()}`, { scroll: false });
  }, []);

  const handleSave = (): void => {
    if (!user?.language) {
      updateLanguage(initialLanguage);
    }
    if (!user?.voice) {
      updateVoice(initialVoice);
    }
    handleOpenSetting();
  };

  return (
    <div className="flex flex-col p-4 gap-1 w-full h-full bg-pink-100 rounded-2xl overflow-y-auto">
      <Image
        className="block select-none mx-auto mt-0"
        src="/logo-icon.png"
        alt="Logo"
        width={60}
        height={60}
        {...{ draggable: false }}
        priority
      />

      {showHomeButton && (
        <button
          onClick={handleOpenSetting}
          className="absolute px-3 rounded-md hover:bg-gray-50 top-4 left-6 text-xl w-fit select-none hover:cursor-pointer active:scale-95 origin-left transition-transform duration-200"
        >
          🏠 Home
        </button>
      )}

      <div className="flex justify-center w-full">
        <div className="flex flex-col w-7/8 gap-4 ">
          <VoiceSelection initVoice={initialVoice} updateVoice={updateVoice} />
          <LanguageSelection
            initLanguage={initialLanguage}
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
          <button
            onClick={handleSave}
            className="flex justify-center mt-5 bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors hover:bg-blue-700 hover:cursor-pointer"
          >
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Option;
