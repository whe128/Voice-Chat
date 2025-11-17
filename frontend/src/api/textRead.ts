import { waitForResponse } from '@/provider/WebSocketProvider';
import { WebSocketRequest } from '@/types/command';
import { logger } from '@/utils/logger';

interface TextReadResponse {
  readAudio: Blob | null;
  error?: string;
}

const apiTextRead = async (
  ws: WebSocket | null,
  requestBody: WebSocketRequest,
): Promise<TextReadResponse> => {
  logger.log(`apiTextRead requestBody: ${JSON.stringify(requestBody)}`);
  try {
    if (ws?.readyState !== WebSocket.OPEN) {
      return { readAudio: null, error: 'WebSocket is not connected' };
    }

    ws.send(JSON.stringify(requestBody));

    // promise to wait for message
    const res = await waitForResponse(ws, 1);

    if (res.length !== 1 || !(res[0] instanceof Blob)) {
      return { readAudio: null, error: 'No audio received from server' };
    }

    return { readAudio: res[0] };
  } catch {
    return {
      readAudio: null,
      error: 'Unknown error',
    };
  }
};

export default apiTextRead;
