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
    private static readonly ConcurrentDictionary<string, VoiceChatRequest> _voiceChatMode =
        new ConcurrentDictionary<string, VoiceChatRequest>();

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
                Console.WriteLine($"⚠️ Invalid request from {userId}: missing 'type'");
                return;
            }

            var type = typeElem.GetString();

            switch (type)
            {
                case "voiceChat":
                    Console.WriteLine($"🎤 {userId} initiated voice chat. Expecting binary next.");
                    string audioType = root.GetProperty("audioType").GetString() ?? "mp3";

                    _voiceChatMode[userId] = new VoiceChatRequest(audioType);
                    break;

                case "textChat":
                    var text = root.GetProperty("content").GetString();
                    Console.WriteLine($"💬 Text chat from {userId}: {text}");
                    await AppWebSocketManager.SendToUserAsync(userId, $"Echo: {text}");
                    break;

                case "textTranslation":
                    var textToTranslate = root.GetProperty("content").GetString();
                    Console.WriteLine($"🌐 Translation request from {userId}: {textToTranslate}");
                    // TODO: caall translation service

                    await AppWebSocketManager.SendToUserAsync(userId, $"Translated: {textToTranslate}");
                    break;

                case "textHistory":
                    Console.WriteLine($"📜 History request from {userId}");
                    // TODO: fetch history data

                    await AppWebSocketManager.SendToUserAsync(userId, "History data...");
                    break;

                default:
                    Console.WriteLine($"⚠️ Unknown request type from {userId}: {type}");
                    break;
            }
        }
        else if (messageType == WebSocketMessageType.Binary)
        {
            // Handle binary data (e.g., voice chat)
            if (_voiceChatMode.TryGetValue(userId, out var voiceChatRequest) && voiceChatRequest != null)
            {
                Console.WriteLine($"🔊 Received voice data from {userId}: {count} bytes");

                byte[] audioBytes = new byte[count];
                Array.Copy(message, audioBytes, count);

                try
                {
                    // Send to speech-to-text service
                    string? transcript = await SpeechToText.Instance.TranscribeAsync(audioBytes, voiceChatRequest.AudioType);
                    Console.WriteLine($"📝 Transcript for {userId}: {transcript}");

                    //TODO: send the transcript to AI chat service and get response

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

    /// <summary>
    /// Reset voice chat mode when user disconnects.
    /// </summary>
    public static void ResetVoiceChatMode(string userId)
    {
        _voiceChatMode.TryRemove(userId, out _);
    }
}
