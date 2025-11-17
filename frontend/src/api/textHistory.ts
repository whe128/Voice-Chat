import { waitForResponse } from '@/provider/WebSocketProvider';
import { WebSocketRequest } from '@/types/command';
import { ChatMessage } from '@/types/message';

interface TextHistoryResponse {
  chatMessages: ChatMessage[];
  error?: string;
}

const apiTextHistory = async (
  ws: WebSocket | null,
): Promise<TextHistoryResponse> => {
  try {
    if (ws?.readyState !== WebSocket.OPEN) {
      return { chatMessages: [], error: 'WebSocket is not connected' };
    }

    ws.send(JSON.stringify({ type: 'textHistory' } as WebSocketRequest));

    // promise to wait for message
    const res = await waitForResponse(ws, 1);

    if (res.length !== 1 || typeof res[0] !== 'string') {
      return { chatMessages: [], error: 'No message received from server' };
    }

    const chatMessages: ChatMessage[] = JSON.parse(res[0]) as ChatMessage[];

    return { chatMessages };
  } catch {
    return {
      chatMessages: [],
      error: 'Unknown error',
    };
  }
};

export default apiTextHistory;
