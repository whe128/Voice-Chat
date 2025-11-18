import { waitForResponse } from '@/provider/WebSocketProvider';
import { WebSocketRequest, TranslationResponse } from '@/types/command';

interface TextTranslationResponse {
  translatedText: string;
  error?: string;
}

const apiTextTranslation = async (
  ws: WebSocket | null,
  requestBody: WebSocketRequest,
): Promise<TextTranslationResponse> => {
  try {
    if (ws?.readyState !== WebSocket.OPEN) {
      return { translatedText: '', error: 'Server is not connected' };
    }

    ws.send(JSON.stringify(requestBody));

    // promise to wait for message
    const res = await waitForResponse(ws, 1);

    if (res.length !== 1 || typeof res[0] !== 'string') {
      return { translatedText: '', error: 'No message received from server' };
    }

    const translatedResponse: TranslationResponse = JSON.parse(
      res[0],
    ) as TranslationResponse;

    if (!translatedResponse.translatedText) {
      return { translatedText: '', error: 'Translate error, Try again.' };
    }

    const translatedText = translatedResponse.translatedText;

    if (!translatedText) {
      return { translatedText: '', error: 'Translate error, Try again.' };
    }

    return { translatedText: translatedResponse.translatedText };
  } catch {
    return {
      translatedText: '',
      error: 'Unknown error',
    };
  }
};

export default apiTextTranslation;
