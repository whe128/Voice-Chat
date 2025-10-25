using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Collections.Concurrent;
using Backend.Services;
using Backend.Models;

namespace Backend.WebSocketCore;
/// <summary>
/// Handles different types of WebSocket requests from clients.
/// </summary>

public static class WebSocketRequestHandler
{
    // Tracks which users are in voice chat mode waiting for binary data
    private static readonly ConcurrentDictionary<string, VoiceChatRequest> _voiceChatMode = new();

    /// <summary>
    /// Process a WebSocket message from a specific user.
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="socket">WebSocket instance</param>
    /// <param name="message">Received message bytes</param>
    /// <param name="messageType">Text or Binary</param>
    public static async Task HandleMessageAsync(string userId, WebSocket socket, byte[] message, WebSocketMessageType messageType, int count)
    {
        if (messageType == WebSocketMessageType.Text)
        {
            var jsonText = Encoding.UTF8.GetString(message, 0, count);
            using var doc = JsonDocument.Parse(jsonText);
            var root = doc.RootElement;

            if (!root.TryGetProperty("type", out var typeElem))
            {
                Console.WriteLine($"Invalid request from {userId}: missing 'type'");
                return;
            }

            var type = typeElem.GetString();
            var language = root.GetProperty("language").GetString() ?? "English";

            if (type == "voiceChat" || type == "textChat" || type == "voiceSample")
            {

                var replyAudioJson = root.GetProperty("replyAudio").GetRawText();
                ReplyAudioOption replyAudioOption = JsonSerializer.Deserialize<ReplyAudioOption>(
                                                replyAudioJson ?? "",
                                                JsonSettings.CamelCase)
                                                ?? new ReplyAudioOption();

                switch (type)
                {
                    case "voiceChat":
                        Console.WriteLine($"🎤 {userId} initiated voice chat. Expecting binary next.");
                        string audioType = root.GetProperty("audioType").GetString() ?? "mp3";

                        _voiceChatMode[userId] = new VoiceChatRequest(audioType, language, replyAudioOption);
                        break;

                    case "textChat":
                        var text = root.GetProperty("content").GetString();
                        await HandleChatResponseAsync(Guid.Parse(userId), socket, text ?? "", language, replyAudioOption);
                        break;

                    // reply with the voice sample
                    case "voiceSample":
                        Console.WriteLine($"🔊 Voice sample request from {userId}");
                        await HandleVoiceSamplAsync(socket, replyAudioOption);
                        break;
                }
            }
            else
            {
                switch (type)
                {
                    // reply with translation
                    case "textTranslation":
                        var textToTranslate = root.GetProperty("content").GetString();
                        Console.WriteLine($"Translation request from {userId}: {textToTranslate} to-> {language}");

                        string? translationPrompt = Formatter.TranslationFormatPrompt(textToTranslate ?? "", language);
                        string? translatedText = await GeminiChat.Instance.SendMessageAsync(translationPrompt ?? "");

                        await AppWebSocketManager.SendTextToUserAsync(socket, translatedText ?? "");
                        break;
                    // fetch chat history
                    case "textHistory":
                        Console.WriteLine($"📜 History request from {userId}");
                        var chatHistory = await ChatHistoryData.GetUserHistoryAsync(Guid.Parse(userId));
                        var historyJson = JsonSerializer.Serialize(chatHistory, JsonSettings.CamelCase);

                        await AppWebSocketManager.SendTextToUserAsync(socket, historyJson);
                        break;

                    default:
                        Console.WriteLine($"⚠️ Unknown request type from {userId}: {type}");
                        break;
                }
            }
        }
        else if (messageType == WebSocketMessageType.Binary)
        {
            // Handle binary data (e.g., voice chat)
            if (_voiceChatMode.TryGetValue(userId, out var voiceChatRequest) && voiceChatRequest != null)
            {

                byte[] audioBytes = new byte[count];
                Array.Copy(message, audioBytes, count);

                try
                {
                    // Send to speech-to-text service
                    string? transcript = await SpeechToText.Instance.TranscribeAsync(audioBytes, voiceChatRequest.AudioType);
                    await HandleChatResponseAsync(Guid.Parse(userId),
                                                    socket, transcript ?? "",
                                                    voiceChatRequest.Language,
                                                    voiceChatRequest.ReplyAudioOption);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️ Error transcribing audio for {userId}: {ex.Message}");
                }

                // After processing, reset voice chat mode
                ResetVoiceChatMode(userId);
            }
            else
            {
                Console.WriteLine($"⚠️ Unexpected binary from {userId} (not in voiceChat mode)");
            }
        }
    }

    public static async Task HandleChatResponseAsync(Guid userId,
                                                    WebSocket socket,
                                                    string requestText,
                                                    string language,
                                                    ReplyAudioOption replyAudioOption)
    {
        // add out message to chat history
        await ChatHistoryData.AddMessageAsync(userId, requestText, isSendOut: true);

        string? formatedMessage = Formatter.ChatFormatPrompt(requestText ?? "", language);
        string? replyMessage = await GeminiChat.Instance.SendMessageAsync(formatedMessage ?? "");

        ChatReply chatReply = JsonSerializer.Deserialize<ChatReply>(
                                                replyMessage ?? "",
                                                JsonSettings.CamelCase)
                                                ?? new ChatReply("", "");
        // add in message to chat history
        await ChatHistoryData.AddMessageAsync(userId, chatReply.ReplyMessage, isSendOut: false);

        byte[]? replyAudio = await TextToAudio.Instance.GetAudioAsync(chatReply.ReplyMessage, replyAudioOption);

        // send reply back to user
        await AppWebSocketManager.SendTextToUserAsync(socket, $"{replyMessage}");
        // send auodio reply back to user
        if (replyAudio != null && replyAudio.Length > 0)
        {
            await AppWebSocketManager.SendBinaryToUserAsync(socket, replyAudio);
        }
    }

    public static async Task HandleVoiceSamplAsync(WebSocket socket,
                                                    ReplyAudioOption replyAudioOption)
    {
        byte[]? replyAudio = await TextToAudio.Instance.GetVoiceSampleAsync(replyAudioOption);

        // send auodio reply back to user
        if (replyAudio != null && replyAudio.Length > 0)
        {
            await AppWebSocketManager.SendBinaryToUserAsync(socket, replyAudio);
        }
    }



    /// <summary>
    /// Reset voice chat mode when user disconnects.
    /// </summary>
    public static void ResetVoiceChatMode(string userId)
    {
        _voiceChatMode.TryRemove(userId, out _);
    }
}
