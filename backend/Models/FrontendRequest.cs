namespace Backend.Models;

public record User(
    string Id,
    string? Name,
    string Email,
    string? Image,
    DateTime? LastLogin,
    string Provider,
    string? Language,
    string? Voice
);

public record ChatMessage(
    string Id,
    string Text,
    bool IsSendOut
);


public record ReplyAudioOption(string Style = "af_bella",
                                string Type = "mp3",
                                double Speed = 1.0);
public record VoiceChatRequest(string AudioType,
                                string Language,
                                ReplyAudioOption ReplyAudioOption);

public record ChatAnalyze(string ReplyMessage, string GrammarError);

public record ChatReply(string OriginalText = "", string ReplyMessage = "", string GrammarError = "");
public record TranslationReply(string TranslatedText);
