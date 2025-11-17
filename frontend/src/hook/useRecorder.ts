// useRecorder.ts
import { logger } from '@/utils/logger';
import { useEffect, useRef, useState } from 'react';

const MIN_RECORD_DURATION = 1000; // at least 500ms

export const useRecorder = (): {
  isRecording: boolean;
  start: () => Promise<void>;
  stop: () => Promise<Blob | null>;
} => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  // cleanup on unmount
  useEffect(
    () => (): void => {
      // stop MediaRecorder
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== 'inactive'
      ) {
        mediaRecorderRef.current.stop();
      }
      // stop all audio track
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      mediaRecorderRef.current = null;
      streamRef.current = null;
      chunksRef.current = [];
      setIsRecording(false);
    },
    [],
  );

  const start = async (): Promise<void> => {
    if (isRecording) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e): void => {
        chunksRef.current.push(e.data);
      };

      startTimeRef.current = Date.now();

      recorder.start();
      setIsRecording(true);
    } catch {
      setIsRecording(false);
    }
  };

  const stop = (): Promise<Blob | null> => {
    try {
      return new Promise((resolve) => {
        const recorder = mediaRecorderRef.current;
        const stream = streamRef.current;

        if (!recorder) {
          return resolve(null);
        }

        recorder.onstop = (): void => {
          if (stream) {
            stream.getTracks().forEach((track) => track.stop());
          }

          const duration = Date.now() - (startTimeRef.current ?? 0);

          if (duration < MIN_RECORD_DURATION) {
            alert(
              `Recording is too short. Please record at least ${MIN_RECORD_DURATION / 1000} seconds.`,
            );
            setIsRecording(false);

            return resolve(null);
          }

          const blob = new Blob(chunksRef.current, {
            type: 'audio/webm',
          });

          // close the stream tracks
          setIsRecording(false);
          chunksRef.current = [];
          mediaRecorderRef.current = null;
          streamRef.current = null;
          startTimeRef.current = null;

          resolve(blob);
        };

        recorder.stop();
      });
    } catch (error) {
      logger.error('Failed to stop recording:', error);
      setIsRecording(false);

      return Promise.resolve(null);
    }
  };

  return {
    isRecording,
    start,
    stop,
  };
};

export default useRecorder;
