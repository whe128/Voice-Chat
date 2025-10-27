'use client';

import { FC, useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { VoiceType, sysVoices } from './type';
import './custom.css';

const VoiceSelectedField: FC<{
  selectedVoice?: VoiceType;
  dropdownOpen?: boolean;
  onClick?: () => void;
}> = ({
  selectedVoice = 'af_bella',
  dropdownOpen = false,
  onClick = undefined,
}) => (
  <div
    onClick={onClick}
    className="flex justify-between items-center w-full gap-2 pl-2 py-2 pr-4 text-gray-800 shadow bg-blue-300/50 border border-gray-300 rounded-lg hover:cursor-pointer"
  >
    {selectedVoice}

    <div
      className={`flex ${dropdownOpen && 'rotate-180'} scale-x-130 select-none scale-y-70 transition-transform duration-300 `}
    >
      V
    </div>
  </div>
);

const VoiceDropdown: FC<{
  voices: VoiceType[];
  dropdownOpen?: boolean;
  selectHandle?: (voice: VoiceType) => void;
  speakHandle?: (voice: VoiceType) => void;
}> = ({
  voices,
  dropdownOpen = false,
  selectHandle = undefined,
  speakHandle = undefined,
}) => (
  <div
    style={{ width: 'calc(100% + 0.4rem)' }}
    className={`absolute w-full h-96 top-18 left-0
    overflow-y-auto scrollbar-custom rounded-lg
    ${dropdownOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
    transition-all duration-100 z-10 bg-pink-100
    `}
  >
    {voices.map((voice, index) => (
      <div
        onClick={() => {
          if (!selectHandle) {
            return;
          }
          selectHandle(voice);
        }}
        key={voice}
        className="flex justify-between items-center w-full gap-2 pl-2 py-1 pr-4 text-gray-800 shadow-lg bg-blue-300/50 border border-gray-300 rounded-lg hover:cursor-pointer"
      >
        <div>
          {index} | {voice}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!speakHandle) {
              return;
            }
            speakHandle(voice);
          }}
          className="text-xl p-1 select-none hover:cursor-pointer active:scale-85 transition-transform duration-200"
        >
          🔉
        </button>
      </div>
    ))}
  </div>
);

const VoiceSelection: FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchParams = useSearchParams();
  const triggerRef = useRef<HTMLDivElement>(null);
  const toggleDropdown = (): void => {
    setDropdownOpen(!dropdownOpen);
  };

  const initialVoice = searchParams.get('voice') ?? sysVoices[0];
  const [selectVoice, setVoice] = useState<VoiceType>(initialVoice);
  const router = useRouter();

  const selectHandle = (voice: VoiceType): void => {
    setDropdownOpen(false);
    if (voice === selectVoice) {
      return;
    }
    setVoice(voice);
    const params = new URLSearchParams(window.location.search);

    params.set('voice', voice);
    router.replace(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        !(event.target instanceof Element) ||
        triggerRef.current?.contains(event.target)
      ) {
        return;
      }
      setDropdownOpen(false);
    };

    window.addEventListener('click', handleClickOutside);

    return (): void => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative flex flex-col">
      <div className="font-bold">Voice Selection</div>
      <div className="w-full" ref={triggerRef}>
        <VoiceSelectedField
          selectedVoice={selectVoice}
          dropdownOpen={dropdownOpen}
          onClick={toggleDropdown}
        />

        <VoiceDropdown
          voices={sysVoices}
          dropdownOpen={dropdownOpen}
          selectHandle={selectHandle}
          speakHandle={undefined}
        />
      </div>
    </div>
  );
};

export default VoiceSelection;
