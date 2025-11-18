import { waitForResponse } from '@/provider/WebSocketProvider';
import { WebSocketRequest } from '@/types/command';
import { logger } from '@/utils/logger';

interface VoiceSampleResponse {
  sampleAudio: Blob | null;
  error?: string;
}

const apiVoiceSample = async (
  ws: WebSocket | null,
  requestBody: WebSocketRequest,
): Promise<VoiceSampleResponse> => {
  logger.log(`apiTextVoice requestBody: ${JSON.stringify(requestBody)}`);
  try {
    if (ws?.readyState !== WebSocket.OPEN) {
      return { sampleAudio: null, error: 'Server is not connected' };
    }

    ws.send(JSON.stringify(requestBody));

    // promise to wait for message
    const res = await waitForResponse(ws, 1);

    if (res.length !== 1 || !(res[0] instanceof Blob)) {
      return { sampleAudio: null, error: 'No audio received from server' };
    }

    return { sampleAudio: res[0] };
  } catch {
    return {
      sampleAudio: null,
      error: 'Unknown error',
    };
  }
};

export default apiVoiceSample;
