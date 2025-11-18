import { waitForResponse } from '@/provider/WebSocketProvider';
import { WebSocketRequest, ReplyMessage } from '@/types/command';
import { logger } from '@/utils/logger';

interface TextChatResponse {
  reply: ReplyMessage | null;
  error?: string;
}

const apiTextChat = async (
  ws: WebSocket | null,
  requestBody: WebSocketRequest,
): Promise<TextChatResponse> => {
  logger.log(`apiTextChat requestBody: ${JSON.stringify(requestBody)}`);
  try {
    if (ws?.readyState !== WebSocket.OPEN) {
      return { reply: null, error: 'Server is not connected' };
    }

    ws.send(JSON.stringify(requestBody));

    // promise to wait for message
    const res = await waitForResponse(ws, 1);

    if (res.length !== 1 || typeof res[0] !== 'string') {
      return { reply: null, error: 'No message received from server' };
    }

    const replyResponse: ReplyMessage = JSON.parse(res[0]) as ReplyMessage;

    if (!replyResponse.originalText || !replyResponse.replyMessage) {
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

export default apiTextChat;
