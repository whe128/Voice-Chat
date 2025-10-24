namespace Backend.Models;

public record User(
    string Id,
    string? Name,
    string Email,
    string? Image
);
public record LoginRequest(string Username, string Password);

public record VoiceChatRequest(string AudioType);


public record ChatReply(string ReplyMessage, string GrammarError);
public record TranslationReply(string TranslationText);
