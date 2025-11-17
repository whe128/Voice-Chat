import { waitForResponse } from '@/provider/WebSocketProvider';
import { WebSocketRequest, ReplyMessage } from '@/types/command';
import { logger } from '@/utils/logger';

interface voiceChatResponse {
  reply: ReplyMessage | null;
  error?: string;
}

const apiVoiceChat = async (
  ws: WebSocket | null,
  requestBody: WebSocketRequest,
  sendAudio: Blob | null,
): Promise<voiceChatResponse> => {
  logger.log(`apiVoiceChat requestBody: ${JSON.stringify(requestBody)}`);
  try {
    if (ws?.readyState !== WebSocket.OPEN) {
      return { reply: null, error: 'WebSocket is not connected' };
    }
    if (!sendAudio) {
      return { reply: null, error: 'No audio to send' };
    }

    // Send both requestBody and audio blob
    ws.send(JSON.stringify(requestBody));
    ws.send(sendAudio);

    // promise to wait for message
    const res = await waitForResponse(ws, 1);

    if (res.length !== 1 || typeof res[0] !== 'string') {
      return { reply: null, error: 'No message received from server' };
    }

    const replyResponse: ReplyMessage = JSON.parse(res[0]) as ReplyMessage;

    if (!replyResponse.originalText) {
      return { reply: null, error: 'No Audio Input, Speak again.' };
    }

    if (!replyResponse.replyMessage) {
      return { reply: null, error: 'Reply error, Try again.' };
    }

    return { reply: replyResponse };
  } catch {
    return {
      reply: null,
      error: 'Unknown error',
    };
  }
};

export default apiVoiceChat;
