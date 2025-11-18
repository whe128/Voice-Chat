import { useEffect, useState, useRef } from 'react';
import { audioTypes, sysVoices } from '@/types/option';
import { WebSocketRequest } from '@/types/command';
import { useSearchParams } from 'next/navigation';
import apiTextRead from '@/api/textRead';
import useUserInfo from './useUserInfo';
import { logger } from '@/utils/logger';

const unlockedBlob = new Blob([new Uint8Array([0])], { type: 'audio/wav' });
const url = URL.createObjectURL(unlockedBlob);

const useTextRead = (
  getWebSocket: (() => Promise<WebSocket>) | null,
  text: string,
  unlockedAudio?: HTMLAudioElement,
): {
  isProcessing: boolean;
  isLoading: boolean;
  isPlaying: boolean;
  error: string;
  handleTextRead: () => Promise<unknown>;
  getUnlockedAudio: () => Promise<HTMLAudioElement>;
} => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const readAudioRef = useRef<Blob | null>(null);
  const readText = useRef<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(unlockedAudio ?? null);
  const audioUrlRef = useRef<string | null>(null);

  const searchParams = useSearchParams();
  const { user } = useUserInfo();

  const voice = user?.voice ?? sysVoices[0];
  const readAudioType = searchParams.get('reply_audio_type') ?? audioTypes[0];

  // clear the read audio when text, voice, or audio type changes
  useEffect(() => {
    cleanup();
  }, [voice, readAudioType]);

  // cleanup on unmount
  useEffect(() => (): void => cleanup(), []);

  const handleReadAudio = async (): Promise<void> => {
    if (!readAudioRef.current) {
      return;
    }
    setIsPlaying(true);

    if (!audioUrlRef.current) {
      const blob = new Blob([readAudioRef.current], {
        type: `audio/${readAudioType}`,
      });
      audioUrlRef.current = URL.createObjectURL(blob);
    }

    // not need to use unlocked audio, create a new one
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrlRef.current);
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setIsProcessing(false);
      });
    }

    //audioRef may come from unlockedAudio, so need to set src each time
    audioRef.current.src = audioUrlRef.current;

    try {
      await audioRef.current.play();
    } catch {
      setIsPlaying(false);
      setIsProcessing(false);
    }
  };

  const handleTextRead = async (): Promise<void> => {
    if (!text.trim()) {
      setError('Cannot read empty text');

      return;
    }

    setIsProcessing(true);
    // same text, already have audio
    if (text === readText.current && readAudioRef.current && !error) {
      logger.log('useTextRead: same text, play cached audio');
      await handleReadAudio();

      return;
    }

    // new text, fetch new audio
    if (readAudioRef.current) {
      readText.current = '';
      audioRef.current = null;
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    }

    readText.current = text;

    setIsLoading(true);

    const ws = getWebSocket ? await getWebSocket() : null;
    const { readAudio: resReplyAudio, error: responseError } =
      await apiTextRead(ws, {
        type: 'textRead',
        content: text,
        replyAudio: {
          style: voice,
          type: readAudioType,
          speed: 1.0,
        },
      } as WebSocketRequest);

    if (responseError) {
      logger.log(`apiTextRead returned error: ${responseError}`);
      setError(responseError);
      setIsLoading(false);
      setIsProcessing(false);
    } else if (resReplyAudio) {
      logger.log('apiTextRead returned audio blob');
      // save and auto play
      readAudioRef.current = resReplyAudio;
      setError('');

      logger.log('useTextRead: new text, play new audio');
      await handleReadAudio();
    }

    setIsLoading(false);
  };

  const stop = (): void => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsProcessing(false);
      setIsLoading(false);
    }
  };

  const cleanup = (): void => {
    stop();
    readText.current = '';
    audioRef.current = null;
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  };

  const getUnlockedAudio = async (): Promise<HTMLAudioElement> => {
    // new a unlocked audio, then add to the MessageBox
    const newAudio = new Audio(url);
    try {
      await newAudio.play();
    } catch {
      // do nothing
    }

    return newAudio;
  };

  return {
    isProcessing,
    isLoading,
    isPlaying,
    error,
    handleTextRead,
    getUnlockedAudio,
  };
};

export default useTextRead;
