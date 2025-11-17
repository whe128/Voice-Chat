import { useState, useRef, useEffect } from 'react';
import { AudioType, audioTypes, VoiceType } from '@/types/option';
import { WebSocketRequest } from '@/types/command';
import { useSearchParams } from 'next/navigation';
import apiVoiceSample from '@/api/voiceSample';
import { logger } from '@/utils/logger';

const useVoiceSample = (
  ws: WebSocket | null,
): {
  isLoading: boolean;
  isPlaying: boolean;
  error: string;
  handleVoiceSample: (voice: AudioType) => Promise<void>;
} => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string>('');

  const cacheAudioRef = useRef<
    Record<string, { blob: Blob | null; url: string | null } | undefined>
  >({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const searchParams = useSearchParams();

  const sampleAudioType = searchParams.get('reply_audio_type') ?? audioTypes[0];

  // clear the read audio when text, voice, or audio type changes
  useEffect(() => {
    cleanup();
  }, [sampleAudioType]);

  // cleanup on unmount
  useEffect(() => (): void => cleanup(), []);

  const handleVoiceSample = async (voice: VoiceType): Promise<void> => {
    logger.log('handleVoiceSample called');

    // use cached audio if available
    const cached = cacheAudioRef.current[voice];

    if (cached?.url) {
      audioUrlRef.current = cached.url;
      audioRef.current = new Audio(cached.url);
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));
      setIsPlaying(true);
      await audioRef.current.play();

      return;
    }

    // fetch new voice sample
    setIsLoading(true);

    const { sampleAudio, error: responseError } = await apiVoiceSample(ws, {
      type: 'voiceSample',
      replyAudio: {
        style: voice,
        type: sampleAudioType,
        speed: 1.0,
      },
    } as WebSocketRequest);

    if (responseError) {
      logger.log(`apiVoiceSample returned error: ${responseError}`);
      setError(responseError);

      return;
    } else {
      setError('');
    }

    setIsLoading(false);

    if (!sampleAudio) {
      setError('No audio received');

      return;
    }

    try {
      setIsPlaying(true);

      const blob = new Blob([sampleAudio], {
        type: `audio/${sampleAudioType}`,
      });
      const url = URL.createObjectURL(blob);
      cacheAudioRef.current[voice] = { blob, url };

      audioUrlRef.current = url;
      audioRef.current = new Audio(url);
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));

      await audioRef.current.play();
    } catch (err) {
      logger.error('Audio play failed:', err);
      //cleanup if there is an error
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const stop = (): void => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const cleanup = (): void => {
    stop();
    audioRef.current = null;
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    Object.values(cacheAudioRef.current).forEach((c) => {
      if (c?.url) {
        URL.revokeObjectURL(c.url);
        c.url = null;
      }

      if (c?.blob) {
        c.blob = null;
      }
    });
    cacheAudioRef.current = {};
  };

  return {
    isLoading,
    isPlaying,
    error,
    handleVoiceSample,
  };
};

export default useVoiceSample;
