using System.Text;
using System.Text.Json;
using Backend.Models;

namespace Backend.Services;

public class TextToAudio
{
    private static TextToAudio? _instance;
    private static readonly object _lock = new();
    private readonly HttpClient _httpClient;
    private readonly string _apiUrl;
    private TextToAudio()
    {
        _apiUrl = Environment.GetEnvironmentVariable("TEXT_TO_AUDIO_API_URL")
            ?? throw new Exception("Text-to-Audio API URL not found in environment variables.");

        string apiKey = Environment.GetEnvironmentVariable("TEXT_TO_AUDIO_API_KEY")
            ?? throw new Exception("Text-to-Audio API key not found in environment variables.");

        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("Authorization", apiKey);
    }

    public static TextToAudio Instance
    {
        get
        {
            if (_instance == null)
            {
                lock (_lock)
                {
                    _instance ??= new TextToAudio();
                }
            }
            return _instance;
        }
    }

    /// <summary>
    /// Sends text string to VoxTTS for text-to-audio transformation.
    /// </summary>
    public async Task<byte[]?> GetAudioAsync(
        string text,
        ReplyAudioOption replyAudioOption)
    {
        // construct request body
        var audioType = replyAudioOption.Type.ToLower();

        object requestBody = audioType switch
        {
            "mp3" => new { text, replyAudioOption.Style, replyAudioOption.Speed, mp3 = true },
            "wav" => new { text, replyAudioOption.Style, replyAudioOption.Speed, wav = true },
            _ => new { text, replyAudioOption.Style, replyAudioOption.Speed },
        };

        string jsonRequest = JsonSerializer.Serialize(requestBody, JsonSettings.CamelCase);
        using var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

        using var response = await _httpClient.PostAsync(_apiUrl, content);
        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        return await response.Content.ReadAsByteArrayAsync();
    }

    /// <summary>
    /// Sends text string to VoxTTS for voice sample generation.
    /// </summary>
    public async Task<byte[]?> GetVoiceSampleAsync(
        ReplyAudioOption replyAudioOption)
    {

        string sampleText = """
            Hi there! This is a voice sample test of the voice system,
            you can choose different voice types.";
            """;

        return await GetAudioAsync(sampleText, replyAudioOption);
    }
}
