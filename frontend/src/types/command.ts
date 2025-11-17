import { AudioType, LanguageType, VoiceType } from '@/types/option';

export type RequestType =
  | 'voiceChat'
  | 'textChat'
  | 'voiceSample'
  | 'textRead'
  | 'textTranslation'
  | 'textHistory';

export interface WebSocketRequest {
  type: RequestType;
  audioType?: AudioType;
  content?: string;
  language?: LanguageType;
  replyAudio?: {
    style: VoiceType;
    type: AudioType;
    speed: number;
  };
}

export interface TempKeyResponse {
  tempKey: string;
  expire: string;
}

export interface TranslationResponse {
  translatedText: string;
}

export interface openLogServerResponse {
  isEnabled: boolean;
}

export interface ReplyMessage {
  originalText: string;
  replyMessage: string;
  grammarError: string;
}
