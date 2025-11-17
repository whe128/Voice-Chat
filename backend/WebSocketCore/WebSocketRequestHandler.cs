using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Collections.Concurrent;
using Backend.Services;
using Backend.Models;
using Backend.Utils;

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
    public static async Task HandleMessageAsync(string userId, string userEmail, WebSocket socket, byte[] message, WebSocketMessageType messageType, int count)
    {
        if (messageType == WebSocketMessageType.Text)
        {
            var jsonText = Encoding.UTF8.GetString(message, 0, count);
            using var doc = JsonDocument.Parse(jsonText);
            var root = doc.RootElement;

            if (!root.TryGetProperty("type", out var typeElem))
            {
                Logger.Log($"Invalid request from {userEmail}:[{userId}] missing 'type'");
                return;
            }

            var type = typeElem.GetString() ?? "";
            string language = root.TryGetProperty("language", out var langElem)
                ? langElem.GetString() ?? "English"
                : "English";

            string text = root.TryGetProperty("content", out var textElem)
                ? textElem.GetString() ?? ""
                : "";

            string replyAudioJson = root.TryGetProperty("replyAudio", out var replyAudioElem)
                ? replyAudioElem.GetRawText() ?? ""
                : "";


            ReplyAudioOption? replyAudioOption = string.IsNullOrEmpty(replyAudioJson.Trim())
                            ? null
                            : JsonSerializer.Deserialize<ReplyAudioOption>(replyAudioJson, JsonSettings.CamelCase);

            switch (type)
            {
                case "voiceChat":
                    Logger.Log($"🎤 {userEmail}:[{userId}] initiated voice chat. Expecting binary next.");
                    string audioType = root.TryGetProperty("audioType", out var audioTypeElem)
                        ? audioTypeElem.GetString() ?? "mp3"
                        : "mp3";

                    _voiceChatMode[userId] = new VoiceChatRequest(audioType, language, replyAudioOption ?? new ReplyAudioOption());
                    break;

                case "textChat":
                    Logger.Log($"💬 Text chat request from {userEmail}:[{userId}]: {text}");
                    await HandleChatResponseAsync(userId, userEmail, socket, text ?? "", language);
                    break;

                // reply with the voice sample
                case "voiceSample":
                    Logger.Log($"🔊 Voice sample request from {userEmail}:[{userId}]");
                    await HandleVoiceSamplAsync(socket, replyAudioOption ?? new ReplyAudioOption());
                    break;

                case "textRead":
                    Logger.Log($"🔊 Text read request from {userEmail}:[{userId}]: {text}");
                    if (text.Trim() != "")
                        await HandleTextReadAsync(socket, text, replyAudioOption ?? new ReplyAudioOption());
                    break;

                // reply with translation
                case "textTranslation":
                    var textToTranslate = root.GetProperty("content").GetString();
                    Logger.Log($"Translation request from {userEmail}:[{userId}]: {textToTranslate} to-> {language}");

                    string translatedText = await NiuTranslation.Instance.TranslateAsync(textToTranslate ?? "", language);
                    TranslationReply translationReply = new(translatedText);
                    string translatedTextJson = JsonSerializer.Serialize(translationReply, JsonSettings.CamelCase);

                    await AppWebSocketManager.SendTextToUserAsync(socket, translatedTextJson ?? "");
                    break;
                // fetch chat history
                case "textHistory":
                    Logger.Log($"📜 History request from {userEmail}:[{userId}]");
                    string historyJson;

                    if (string.Equals(userEmail, "guest", StringComparison.OrdinalIgnoreCase))
                    {
                        historyJson = "[]"; // empty history for guest
                    }
                    else
                    {
                        var chatHistory = await ChatHistoryData.GetUserHistoryAsync(Guid.Parse(userId));
                        historyJson = JsonSerializer.Serialize(chatHistory, JsonSettings.CamelCase);
                    }


                    await AppWebSocketManager.SendTextToUserAsync(socket, historyJson);
                    break;

                default:
                    Logger.Log($"⚠️ Unknown request type from {userId}: {type}");
                    break;
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

                    //test simulate
                    await HandleChatResponseAsync(userId,
                                                userEmail,
                                                socket, transcript ?? "",
                                                voiceChatRequest.Language);
                }
                catch (Exception ex)
                {
                    Logger.Log($"⚠️ Error transcribing audio for {userId}: {ex.Message}");
                }

                // After processing, reset voice chat mode
                ResetVoiceChatMode(userId);
            }
            else
            {
                Logger.Log($"⚠️ Unexpected binary from {userId} (not in voiceChat mode)");
            }
        }
    }

    public static async Task HandleChatResponseAsync(string userId,
                                                    string userEmail,
                                                    WebSocket socket,
                                                    string requestText,
                                                    string language)
    {
        // add out message to chat history
        if (!string.Equals(userEmail, "guest", StringComparison.OrdinalIgnoreCase))
        {
            await ChatHistoryData.AddMessageAsync(Guid.Parse(userId), requestText, isSendOut: true);
        }


        string? formatedMessage = Formatter.ChatFormatPrompt(requestText ?? "", language);
        string? replyMessage = await GeminiChat.Instance.SendMessageAsync(formatedMessage ?? "");


        ChatAnalyze chatAnalyse = JsonSerializer.Deserialize<ChatAnalyze>(replyMessage ?? "",
                                                JsonSettings.CamelCase)
                                                ?? new ChatAnalyze("", "");

        // send reply back to user
        var chatReply = new ChatReply(requestText ?? "",
                                    chatAnalyse.ReplyMessage,
                                    chatAnalyse.GrammarError);

        // add in message to chat history
        if (!string.Equals(userEmail, "guest", StringComparison.OrdinalIgnoreCase))
        {
            await ChatHistoryData.AddMessageAsync(Guid.Parse(userId), chatReply.ReplyMessage, isSendOut: false);
        }

        string chatReplyJson = JsonSerializer.Serialize(chatReply, JsonSettings.CamelCase);


        await AppWebSocketManager.SendTextToUserAsync(socket, chatReplyJson);
    }
    public static async Task HandleTextReadAsync(WebSocket socket,
                                                    string text,
                                                    ReplyAudioOption replyAudioOption)
    {
        Logger.Log($"🔊 Text read request received.  {replyAudioOption}");
        byte[]? replyAudio = await TextToAudio.Instance.GetAudioAsync(text, replyAudioOption);

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
