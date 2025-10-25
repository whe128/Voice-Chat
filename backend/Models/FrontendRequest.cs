namespace Backend.Models;

public record User(
    string Id,
    string? Name,
    string Email,
    string? Image,
    DateTime? LastLogin
);

public record ChatMessage(
    string Message,
    DateTime Time,
    bool IsSendOut
);
public record LoginRequest(string Email, string Password);

public record RegistRequest(string Email, string Password);

public record DeleteAccountRequest(string Email);

public record ReplyAudioOption(string Style = "af_bella",
                                string Type = "mp3",
                                double Speed = 1.0);
public record VoiceChatRequest(string AudioType,
                                string Language,
                                ReplyAudioOption ReplyAudioOption);


public record ChatReply(string ReplyMessage, string GrammarError);
public record TranslationReply(string TranslatedText);
