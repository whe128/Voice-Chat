import apiTextTranslation from '@/api/textTranslation';
import { useEffect, useState, useRef } from 'react';
import { sysLanguages } from '@/types/option';
import { WebSocketRequest } from '@/types/command';
import useUserInfo from './useUserInfo';
import { logger } from '@/utils/logger';

const useTextTranslation = (
  getWebSocket: (() => Promise<WebSocket>) | null,
  text: string,
): {
  translatedText: string;
  isTranslating: boolean;
  error: string;
  handleTranslation: () => Promise<unknown>;
} => {
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState('');
  const needTranslateText = useRef<string>('');
  const { user } = useUserInfo();

  const language = user?.language ?? sysLanguages[0];

  // clear the translated text when language changes
  useEffect(() => {
    setTranslatedText('');
    setIsTranslating(false);
    setError('');
  }, [language]);

  const handleTranslation = async (): Promise<void> => {
    if (!text.trim()) {
      setIsTranslating(false);

      return;
    }

    if (text === needTranslateText.current && translatedText && !error) {
      logger.log('Text is already translated.');

      // No need to translate again
      return;
    }

    // mark the text that is being translated
    needTranslateText.current = text;

    setIsTranslating(true);

    const ws = getWebSocket ? await getWebSocket() : null;

    const { translatedText: resTranslate, error: responseError } =
      await apiTextTranslation(ws, {
        type: 'textTranslation',
        content: text,
        language,
      } as WebSocketRequest);

    if (responseError) {
      setError(responseError);
    } else if (resTranslate) {
      setTranslatedText(resTranslate);
      setError('');
    }

    setIsTranslating(false);
  };

  return {
    translatedText,
    isTranslating,
    error,
    handleTranslation,
  };
};

export default useTextTranslation;
