using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

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
                    if (_instance == null)
                    {
                        _instance = new TextToAudio();
                    }
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
        string style = "af_bella",
        double speed = 1.0,
        string contentType = "mp3")
    {
        var requestBody = new
        {
            text,
            style,
            speed,
            mp3 = contentType.ToLower() == "mp3"
        };

        string jsonRequest = JsonSerializer.Serialize(requestBody);
        using var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

        using var response = await _httpClient.PostAsync(_apiUrl, content);
        if (!response.IsSuccessStatusCode)
        {
            Console.WriteLine($"⚠️ Text-to-Audio API error: {response.StatusCode}");
            return null;
        }

        return await response.Content.ReadAsByteArrayAsync();
    }
}
