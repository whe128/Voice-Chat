import { useEffect, useState, useRef } from 'react';
import { audioTypes, sysVoices } from '@/types/option';
import { WebSocketRequest } from '@/types/command';
import { useSearchParams } from 'next/navigation';
import apiTextRead from '@/api/textRead';
import useUserInfo from './useUserInfo';
import { logger } from '@/utils/logger';

const useTextRead = (
  ws: WebSocket | null,
  text: string,
): {
  readAudio: Blob | null;
  isProcessing: boolean;
  isLoading: boolean;
  isPlaying: boolean;
  error: string;
  handleTextRead: () => Promise<unknown>;
} => {
  const [readAudio, setReadAudio] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const readText = useRef<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
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

  // automatic play when readAudio is set
  useEffect(() => {
    if (readAudio && !isPlaying && !isLoading) {
      void handleReadAudio();
    }
  }, [readAudio]);

  const handleReadAudio = async (): Promise<void> => {
    if (!readAudio) {
      return;
    }
    setIsPlaying(true);

    if (!audioUrlRef.current) {
      const blob = new Blob([readAudio], { type: `audio/${readAudioType}` });
      audioUrlRef.current = URL.createObjectURL(blob);
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrlRef.current);
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setIsProcessing(false);
      });
    }

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
    if (text === readText.current && readAudio && !error) {
      await handleReadAudio();

      return;
    }

    // new text, fetch new audio
    if (readAudio) {
      readText.current = '';
      audioRef.current = null;
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    }

    readText.current = text;

    setIsLoading(true);

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
    } else if (resReplyAudio) {
      logger.log('apiTextRead returned audio blob');
      setReadAudio(resReplyAudio);

      setError('');
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

  return {
    readAudio,
    isProcessing,
    isLoading,
    isPlaying,
    error,
    handleTextRead,
  };
};

export default useTextRead;
