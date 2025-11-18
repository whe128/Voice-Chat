import apiTextChat from '@/api/textChat';
import apiVoiceChat from '@/api/voiceChat';
import { useState } from 'react';
import { sysLanguages, audioTypes } from '@/types/option';
import { ReplyMessage, WebSocketRequest } from '@/types/command';
import { useSearchParams } from 'next/navigation';
import useUserInfo from './useUserInfo';

const useChat = (
  getWebSocket: (() => Promise<WebSocket>) | null,
): {
  isChatting: boolean;
  error: string;
  handleTextChat: (text: string) => Promise<ReplyMessage | null>;
  handleVoiceChat: (sendAudio: Blob | null) => Promise<ReplyMessage | null>;
} => {
  const { user } = useUserInfo();
  const [isChatting, setIsChatting] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();

  const sendAudioType = searchParams.get('send_audio_type') ?? audioTypes[0];
  const language = user?.language ?? sysLanguages[0];

  const handleTextChat = async (text: string): Promise<ReplyMessage | null> => {
    if (!text.trim()) {
      setError('Cannot send empty text');
      setIsChatting(false);

      return null;
    }

    setIsChatting(true);
    try {
      const ws = getWebSocket ? await getWebSocket() : null;

      const { reply: resReply, error: textChatError } = await apiTextChat(ws, {
        type: 'textChat',
        content: text,
        language,
      } as WebSocketRequest);

      setIsChatting(false);

      if (textChatError) {
        setError(textChatError);

        return null;
      } else if (!resReply) {
        setError('TextChat Reply error, Please Send again.');

        return null;
      } else {
        setError('');

        return resReply;
      }
    } catch {
      setIsChatting(false);
      setError('Unknown error');

      return null;
    }
  };

  const handleVoiceChat = async (
    sendAudio: Blob | null,
  ): Promise<ReplyMessage | null> => {
    if (!sendAudio) {
      setError('Cannot send empty audio');
      setIsChatting(false);

      return null;
    }

    setIsChatting(true);

    try {
      const ws = getWebSocket ? await getWebSocket() : null;
      const { reply, error: voiceChatError } = await apiVoiceChat(
        ws,
        {
          type: 'voiceChat',
          audioType: sendAudioType,
          language,
        } as WebSocketRequest,
        sendAudio,
      );

      setIsChatting(false);

      if (voiceChatError) {
        setError(voiceChatError);

        return null;
      } else if (!reply) {
        setError('VoiceChat Reply error, Please Send again.');

        return null;
      } else {
        return reply;
      }
    } catch {
      setIsChatting(false);
      setError('Unknown error');

      return null;
    }
  };

  return {
    isChatting,
    error,
    handleTextChat,
    handleVoiceChat,
  };
};

export default useChat;
