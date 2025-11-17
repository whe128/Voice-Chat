'use client';

import { FC, useEffect, useState, useRef, useContext } from 'react';
import { VoiceType, sysVoices } from '@/types/option';
import './custom.css';
import useVoiceSample from '@/hook/useVoiceSample';
import { WebSocketContext } from '@/provider/WebSocketProvider';

const VoiceSelectedField: FC<{
  selectedVoice?: VoiceType;
  dropdownOpen?: boolean;
  onClick?: () => void;
}> = ({
  selectedVoice = 'af_bella',
  dropdownOpen = false,
  onClick = undefined,
}) => (
  <button
    onClick={onClick}
    className="flex justify-between items-center w-full gap-2 pl-2 py-2 pr-4 text-gray-800 shadow bg-blue-300/50 border border-gray-300 rounded-lg hover:cursor-pointer"
  >
    {selectedVoice}

    <div
      className={`flex ${dropdownOpen && 'rotate-180'} scale-x-130 select-none scale-y-70 transition-transform duration-300 `}
    >
      V
    </div>
  </button>
);

const VoiceDropdown: FC<{
  voices: VoiceType[];
  dropdownOpen?: boolean;
  selectHandle?: (voice: VoiceType) => void;
  speakHandle?: (voice: VoiceType) => void;
}> = ({ voices, dropdownOpen = false, selectHandle = undefined }) => {
  const wsContext = useContext(WebSocketContext);
  const [loadingVoice, setLoadingVoice] = useState<string | null>(null);
  const speakerFrames = ['🔈', '🔉', '🔊'];
  const [speakerIndex, setSpeakerIndex] = useState(0);
  const ws = wsContext?.ws ?? null;

  const {
    isLoading: isAudioLoading,
    isPlaying: isAudioPlaying,
    handleVoiceSample,
  } = useVoiceSample(ws);

  useEffect(() => {
    if (!isAudioPlaying) {
      return;
    }

    const interval = setInterval(() => {
      setSpeakerIndex((prev) => (prev + 1) % speakerFrames.length);
    }, 150);

    return (): void => clearInterval(interval);
  }, [isAudioPlaying]);

  return (
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

          <div className="flex m-1 items-center w-10 h-fit">
            <button
              onClick={(e) => {
                e.stopPropagation();
                void handleVoiceSample(voice);
                setLoadingVoice(voice);
              }}
              disabled={isAudioLoading || isAudioPlaying}
              className={`text-xl select-none transition-transform duration-200

                        ${
                          isAudioLoading || isAudioPlaying
                            ? ''
                            : 'hover:cursor-pointer active:scale-85'
                        }
                    `}
            >
              {loadingVoice === voice && isAudioLoading ? (
                <div className="w-5 h-5 border-4 m-1 border-gray-300 border-t-green-500 rounded-full animate-spin" />
              ) : loadingVoice === voice && isAudioPlaying ? (
                speakerFrames[speakerIndex]
              ) : (
                '🔉'
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

interface Props {
  initVoice?: VoiceType | null;
  updateVoice?: (voice: VoiceType) => void;
}

const VoiceSelection: FC<Props> = ({
  initVoice = sysVoices[0],
  updateVoice = undefined,
}: Props) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [selectVoice, setVoice] = useState<VoiceType>(
    initVoice ?? sysVoices[0],
  );

  const toggleDropdown = (): void => {
    setDropdownOpen(!dropdownOpen);
  };

  const selectHandle = (voice: VoiceType): void => {
    setDropdownOpen(false);
    if (voice === selectVoice) {
      return;
    }
    setVoice(voice);
    updateVoice?.(voice);
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
    <div className="relative select-none flex flex-col">
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
        />
      </div>
    </div>
  );
};

export default VoiceSelection;
