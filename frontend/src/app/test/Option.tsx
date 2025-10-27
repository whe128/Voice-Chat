'use client';

import { FC } from 'react';
import { AudioType, LanguageType, VoiceType, audioTypes } from './type';
import VoiceSelection from './VoiceDrawdonSelection';
import LanguageSelection from './LanguageDrawdownSelection';
import ToggleSelection from './SingleSelection';
import './custom.css';

interface OptionProps {
  audioType: AudioType;
  language: LanguageType;
  replyAudio: {
    style: VoiceType;
    type: AudioType;
    speed?: number;
  };
}

const Option: FC = () => (
  <div className="flex flex-wrap p-4">
    <div className="flex flex-col p-4 gap-1 w-100 h-148 bg-pink-100/50 rounded-2xl">
      <div className="flex justify-center text-blue-800 text-3xl font-bold">
        Option
      </div>

      <div className="flex flex-col gap-4 ">
        <VoiceSelection />
        <LanguageSelection />
        <ToggleSelection attribute="audio-type" options={audioTypes} />
        <ToggleSelection attribute="reply-audio-type" options={audioTypes} />
      </div>
    </div>
  </div>
);

export type { OptionProps };

export default Option;
