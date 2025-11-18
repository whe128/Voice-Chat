import { FC, useState, useContext, useEffect, useRef } from 'react';
import './custom.css';
import useTextTranslation from '@/hook/useTextTranslation';
import useTextRead from '@/hook/useTextRead';
import { WebSocketContext } from '@/provider/WebSocketProvider';
import useChat from '@/hook/useChat';
import useChatHistory from '@/hook/useChatHistory';
import { useRecorder } from '@/hook/useRecorder';
import Image from 'next/image';

interface SendMessageBarProps {
  hasGetChatHistory?: boolean;
}

const SendMessageBar: FC<SendMessageBarProps> = ({
  hasGetChatHistory = false,
}: SendMessageBarProps) => {
  const wsContext = useContext(WebSocketContext);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [isChatMode, setIsChatMode] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const [inputText, setInputText] = useState('');

  const speakerFrames = ['🔈', '🔉', '🔊'];
  const [speakerIndex, setSpeakerIndex] = useState(0);

  const {
    translatedText,
    isTranslating,
    error: translatedError,
    handleTranslation,
  } = useTextTranslation(wsContext?.getWebSocket ?? null, inputText);

  const showMessage = showTranslation
    ? translatedError
      ? translatedError
      : translatedText
    : inputText;

  const {
    isProcessing: isAudioProcessing,
    isLoading: isAudioLoading,
    isPlaying: isAudioPlaying,
    handleTextRead,
    getUnlockedAudio,
  } = useTextRead(wsContext?.getWebSocket ?? null, showMessage);

  const {
    error: chatError,
    isChatting,
    handleTextChat,
    handleVoiceChat,
  } = useChat(wsContext?.getWebSocket ?? null);

  const { isRecording, start, stop } = useRecorder();

  const {
    addMessage,
    updateGrammarCheck,
    updateMessageText,
    updateHasGrammarCheck,
    deleteMessage,
  } = useChatHistory(wsContext?.getWebSocket ?? null);

  // disable button
  const translationDisable = isTranslating || isAudioProcessing;
  const inputDisable = isTranslating || isAudioProcessing;
  const sendDisable = showTranslation || isTranslating || isAudioProcessing;
  const speakerDisable = showTranslation || isTranslating || isAudioProcessing;
  const switchModeDisable =
    showTranslation || isTranslating || isAudioProcessing || isRecording;

  // transparent for each button
  const translationOpacity = isAudioProcessing;
  const sendOpacity = showTranslation || isTranslating || isAudioProcessing;
  const speakerOpacity = showTranslation || isTranslating;
  const switchModeOpacity =
    showTranslation || isTranslating || isAudioProcessing || isRecording;

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
    if (!showTranslation) {
      const el = inputRef.current;
      el?.focus();
      el?.setSelectionRange(el.value.length, el.value.length);
    }
  }, [showTranslation]);

  const toggleTranslation = (): void => {
    if (!isTranslating && !showTranslation) {
      if (!inputText.trim()) {
        return;
      }
      void handleTranslation();
    }

    setShowTranslation(!showTranslation);
  };

  const handleStopRecording = async (): Promise<void> => {
    const voiceBlob = await stop();
    if (!voiceBlob) {
      return;
    }

    const unlockedAudio = await getUnlockedAudio();

    const messageId = Date.now().toString();
    // add a send message
    addMessage({
      id: messageId,
      isSendOut: true,
      hasGrammarCheck: true,
    });

    // add a reply message
    addMessage({
      id: `reply${messageId}`,
      isSendOut: false,
      autoRead: true,
      unlockedAudio,
    });

    const reply = await handleVoiceChat(voiceBlob);

    // update grammar check and voice text result
    if (reply) {
      updateMessageText(`${messageId}`, reply.originalText);
      updateGrammarCheck(messageId, reply.grammarError);
      updateMessageText(`reply${messageId}`, reply.replyMessage);
    } else {
      deleteMessage(messageId);
      // remove the placeholder reply message
      deleteMessage(`reply${messageId}`);

      if (chatError) {
        alert(`${chatError}\nPlease send again.`);
      } else {
        alert('Failed to get reply from server\n Please send again.');
      }
    }
  };

  const handleSendText = async (): Promise<void> => {
    if (!inputText.trim()) {
      return;
    }
    const sendText = inputText;
    setInputText('');

    const unlockedAudio = await getUnlockedAudio();
    const messageId = Date.now().toString();

    // add send message to chat history
    addMessage({
      id: messageId,
      text: sendText,
      isSendOut: true,
      hasGrammarCheck: true,
    });

    // add a placeholder for the reply message
    addMessage({
      id: `reply${messageId}`,
      isSendOut: false,
      autoRead: true,
      unlockedAudio,
    });

    const reply = await handleTextChat(sendText);

    // update grammar check result
    if (reply) {
      updateGrammarCheck(messageId, reply.grammarError);
      updateMessageText(`reply${messageId}`, reply.replyMessage);
    } else {
      // remove the placeholder reply message
      deleteMessage(`reply${messageId}`);
      // close the grammar check for the sent message
      updateHasGrammarCheck(messageId, false);

      if (chatError) {
        alert(`${chatError}\nPlease send again.`);
      } else {
        alert('Failed to get reply from server\n Please send again.');
      }
    }
  };

  return (
    <div
      className={`flex mt-1 gap-2 justify-between items-center
        ${hasGetChatHistory ? '' : 'opacity-50 pointer-events-none'}`}
    >
      {isChatMode ? (
        <button
          onClick={
            isRecording
              ? (): void => void handleStopRecording()
              : (): void => void start()
          }
          disabled={isChatting}
          className={`flex justify-center items-center w-4/5 h-9 select-none ml-3 focus:outline-none background bg-gray-50 rounded-xl border border-gray-300 text-gray-400 transition-transform duration-200
            ${isChatting ? 'pointer-events-none' : 'hover:cursor-pointer active:scale-95'}`}
        >
          {isChatting ? (
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              <div>Chatting...</div>
            </div>
          ) : isRecording ? (
            <div className="flex items-center gap-4">
              <Image
                className="block select-none mx-auto animate-recording"
                src="/stop.png"
                alt="Logo"
                width={25}
                height={25}
                {...{ draggable: false }}
                priority
              />
              Tap to stop
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Image
                className="block select-none mx-auto"
                src="/microphone.png"
                alt="Logo"
                width={25}
                height={25}
                style={{ width: 'auto', height: '25px' }}
                {...{ draggable: false }}
                priority
              />
              Tap to record
            </div>
          )}
        </button>
      ) : (
        <div className="flex gap-1 w-full justify-between items-center">
          <div className="flex flex-col gap-1 items-start justify-center w-12">
            <button
              disabled={translationDisable}
              onClick={toggleTranslation}
              className={`text-2xl select-none transition-transform duration-200
                ${translationDisable ? (translationOpacity ? 'opacity-20' : '') : 'hover:cursor-pointer active:scale-85'}`}
            >
              🔁
            </button>

            <button
              onClick={(): void => void handleTextRead()}
              disabled={speakerDisable}
              className={`select-none transition-transform duration-200
                ${speakerDisable ? (speakerOpacity ? 'opacity-20' : '') : 'hover:cursor-pointer active:scale-85'}`}
            >
              {isAudioLoading ? (
                <div className="w-6 h-6 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin" />
              ) : (
                <div className="flex items-center text-3xl">
                  {isAudioPlaying ? speakerFrames[speakerIndex] : '🔉'}
                </div>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1 w-full p-1 bg-gray-100 rounded-xl border border-gray-300">
            {!showTranslation ? (
              <textarea
                ref={inputRef}
                onChange={(e) => {
                  setInputText(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSendText();
                  }
                }}
                readOnly={inputDisable}
                value={inputText}
                placeholder="input message..."
                className={`text-s w-full h-18 px-2 py-1 background rounded-xl bg-gray-50 resize-none focus:outline-none
                    ${inputDisable ? 'cursor-default' : 'cursor-text'}`}
              />
            ) : (
              <div
                onClick={toggleTranslation}
                className={`text-s w-full h-18 px-2 py-1 background rounded-xl hover:cursor-pointer
                ${translatedError ? 'text-red-500' : ''} overflow-y-auto
                ${isTranslating ? 'bg-gray-50' : 'bg-yellow-50'}`}
              >
                {isTranslating ? (
                  <div className="grid place-items-center h-full">
                    <div className="w-8 h-8 border-5 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                ) : (
                  <span className={translatedError ? 'text-red-500' : ''}>
                    {showMessage}
                  </span>
                )}
              </div>
            )}

            <button
              onClick={(): void => void handleSendText()}
              disabled={sendDisable}
              className={`background px-2 py-1 rounded-md bg-green-400 select-none transition-transform duration-200
                ${sendDisable ? (sendOpacity ? 'opacity-20' : '') : 'hover:cursor-pointer active:scale-85'}`}
            >
              📤
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setIsChatMode(!isChatMode)}
        className={`text-2xl select-none background rounded-lg transition-transform duration-200 focus:outline-none
             ${switchModeDisable ? (switchModeOpacity ? 'opacity-20' : '') : 'hover:cursor-pointer active:scale-85'}`}
      >
        {isChatMode ? (
          '⌨️'
        ) : (
          <Image
            className="block select-none mx-auto "
            src="/microphone.png"
            alt="Logo"
            width={35}
            height={35}
            {...{ draggable: false }}
            priority
          />
        )}
      </button>
    </div>
  );
};

export default SendMessageBar;
