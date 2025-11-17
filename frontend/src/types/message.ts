export interface ChatMessage {
  id: string;
  text?: string;
  isSendOut?: boolean;
  hasGrammarCheck?: boolean;
  grammarHasChecked?: boolean;
  grammarError?: string;
  autoRead?: boolean;
}
