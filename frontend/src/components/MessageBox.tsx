import { FC, useState, useContext, useEffect, useRef } from 'react';
import './custom.css';
import useTextTranslation from '@/hook/useTextTranslation';
import useTextRead from '@/hook/useTextRead';
import { WebSocketContext } from '@/provider/WebSocketProvider';

export const MessageBoxSuspense: FC = () => (
  <>
    <div className="flex items-center">
      <button className="block px-1 py-0.5 select-none opacity-20">🔁</button>
      <div className="grid place-items-center w-1/3 h-10 shadow text-sm p-1 break-words rounded-xl bg-gray-200/80 select-none animate-pulse">
        <div className="w-5 h-5 border-4 border-gray-300 border-t-pink-500 rounded-full animate-spin" />
      </div>

      <button className="text-xl p-1 select-none opacity-20 ">🔉</button>
    </div>
    <div className="flex justify-end items-center">
      <button className="text-xl p-1 select-none opacity-20 rotate-180">
        🔉
      </button>
      <div className="grid place-items-center w-1/3 h-10 shadow text-sm p-1 break-words rounded-xl bg-gray-200/80 select-none animate-pulse">
        <div className="w-5 h-5 border-4 border-gray-300 border-t-pink-500 rounded-full animate-spin" />
      </div>

      <button className="block px-1 py-0.5 select-none opacity-20">🔁</button>
    </div>
  </>
);

interface MessageBoxProps {
  text?: string;
  isSendOut?: boolean;
  hasGrammarCheck?: boolean;
  grammarHasChecked?: boolean;
  grammarError?: string;
  autoRead?: boolean;
  unlockedAudio?: HTMLAudioElement;
}

const MessageBox: FC<MessageBoxProps> = ({
  text = '',
  isSendOut = true,
  hasGrammarCheck = false,
  grammarHasChecked = false,
  grammarError = '',
  autoRead = false,
  unlockedAudio = undefined,
}) => {
  const wsContext = useContext(WebSocketContext);
  const [openGrammarError, setOpenGrammarError] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const speakerFrames = ['🔈', '🔉', '🔊'];
  const [speakerIndex, setSpeakerIndex] = useState(0);

  const finishAutoReadRef = useRef(false);

  const {
    translatedText,
    isTranslating,
    error: translatedError,
    handleTranslation,
  } = useTextTranslation(wsContext?.getWebSocket ?? null, text);

  const showMessage = showTranslation
    ? translatedError
      ? translatedError
      : translatedText
    : text;

  const {
    isProcessing: isAudioProcessing,
    isLoading: isAudioLoading,
    isPlaying: isAudioPlaying,
    handleTextRead,
  } = useTextRead(wsContext?.getWebSocket ?? null, showMessage, unlockedAudio);

  // whole component disable for click
  const shouldDisable = isTranslating || isAudioProcessing;

  // for transparent
  const translationOpacity = isAudioProcessing;

  useEffect(() => {
    // all translation results are cleared,
    // and current is showing translation
    if (!translatedText && !translatedError && showTranslation) {
      setShowTranslation(false);
    }
  }, [translatedText, translatedError]);

  useEffect(() => {
    if (!isAudioPlaying) {
      return;
    }

    const interval = setInterval(() => {
      setSpeakerIndex((prev) => (prev + 1) % speakerFrames.length);
    }, 150);

    return (): void => clearInterval(interval);
  }, [isAudioPlaying]);

  useEffect(() => {
    if (
      autoRead &&
      text &&
      !isAudioProcessing &&
      !finishAutoReadRef.current &&
      text
    ) {
      finishAutoReadRef.current = true;
      void handleTextRead();
    }
  }, [text, autoRead]);

  const toggleTranslation = (): void => {
    if (!isTranslating && !translatedText && !showTranslation) {
      void handleTranslation();
    }

    setShowTranslation(!showTranslation);
  };

  const handleReadAudio = (): void => {
    if (!isAudioProcessing) {
      void handleTextRead();
    }
  };

  if (isSendOut) {
    return (
      <div className="flex w-full justify-end">
        <div className="flex flex-col items-end max-w-6/9 min-w-3/12">
          <div className="flex w-full items-center justify-between">
            <div className="w-7 rotate-180 flex items-center">
              <button
                onClick={() => handleReadAudio()}
                disabled={shouldDisable}
                className={`
                px-1 select-none transition-transform duration-200
                ${shouldDisable ? '' : 'hover:cursor-pointer active:scale-85'}
                ${showTranslation ? 'invisible' : 'visible'}`}
              >
                {isAudioLoading ? (
                  <div className="w-5 h-5 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin" />
                ) : (
                  <div className="w-8 h-5 flex text-xl items-center">
                    {isAudioPlaying ? speakerFrames[speakerIndex] : '🔉'}
                  </div>
                )}
              </button>
            </div>

            <div className="flex w-full min-h-7 justify-center h-content shadow text-sm p-1 break-words break-all rounded-xl bg-green-300/40">
              {isTranslating || !text ? (
                <div className="w-5 h-5 border-4 border-gray-300 border-t-pink-500 rounded-full animate-spin" />
              ) : (
                <span
                  className={
                    translatedError && showTranslation ? 'text-red-500' : ''
                  }
                >
                  {showMessage}
                </span>
              )}
            </div>

            <button
              disabled={shouldDisable}
              onClick={toggleTranslation}
              className={`block px-1 py-0.5 select-none transition-transform duration-200
            ${shouldDisable ? (translationOpacity ? 'opacity-20' : '') : 'hover:cursor-pointer active:scale-85'}`}
            >
              🔁
            </button>
          </div>

          {hasGrammarCheck &&
            text &&
            (!grammarHasChecked ? (
              <div className="flex items-center text-[8px] select-none w-fit px-1 background bg-green-300/70 rounded-md mt-0 self-start ml-7">
                <div className="w-2 h-2 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                <span>checking</span>
              </div>
            ) : !grammarError ? (
              <div className="text-[8px] select-none w-fit px-1 background bg-green-300/70 rounded-md mt-0 self-start ml-7">
                ✅Correct
              </div>
            ) : (
              <button
                onClick={() => setOpenGrammarError(!openGrammarError)}
                className="flex flex-col text-xs shadow w-fit background mr-7 bg-red-300 rounded-md hover:cursor-pointer px-1 py-0.5 mt-0 self-start ml-7"
              >
                <span className="text-[8px] select-none hover:cursor-pointer px-1 underline">
                  ❌Grammar Error
                </span>
                {openGrammarError && (
                  <div className="px-1 break-words break-all">
                    {grammarError}
                  </div>
                )}
              </button>
            ))}
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex items-center">
        <button
          disabled={shouldDisable}
          onClick={toggleTranslation}
          className={`block px-1 py-0.5 select-none transition-transform duration-200
            ${shouldDisable ? (translationOpacity ? 'opacity-20' : '') : 'hover:cursor-pointer active:scale-85'}`}
        >
          🔁
        </button>
        <div className="flex justify-center w-fit max-w-5/9 min-w-1/9 min-h-7 h-content shadow text-sm p-1 break-words break-all rounded-xl bg-yellow-200/80">
          {isTranslating || !text ? (
            <div className="w-5 h-5 border-4 border-gray-300 border-t-pink-500 mx-5 rounded-full animate-spin" />
          ) : (
            <span
              className={
                translatedError && showTranslation ? 'text-red-500' : ''
              }
            >
              {showMessage}
            </span>
          )}
        </div>
        {!showTranslation && (
          <button
            onClick={() => handleReadAudio()}
            disabled={shouldDisable}
            className={`
                p-1 select-none transition-transform duration-200
                ${shouldDisable ? '' : 'hover:cursor-pointer active:scale-85 '}
            `}
          >
            {isAudioLoading ? (
              <div className="w-5 h-5 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            ) : (
              <div className="w-8 h-5 flex items-center text-xl">
                {isAudioPlaying ? speakerFrames[speakerIndex] : '🔉'}
              </div>
            )}
          </button>
        )}
      </div>
    );
  }
};

export default MessageBox;
