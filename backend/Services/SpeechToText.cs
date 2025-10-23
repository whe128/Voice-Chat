using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace Backend.Services;

public class SpeechToText
{
    private static SpeechToText? _instance;
    private static readonly object _lock = new object();

    private readonly HttpClient _httpClient;

    private SpeechToText()
    {
        string apiKey = Environment.GetEnvironmentVariable("SPEECH_TO_TEXT_API_KEY")
            ?? throw new Exception("Speech-to-Text API key not found in environment variables.");

        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Token {apiKey}");
    }

    public static SpeechToText Instance
    {
        get
        {
            if (_instance == null)
            {
                lock (_lock)
                {
                    if (_instance == null)
                    {
                        _instance = new SpeechToText();
                    }
                }
            }
            return _instance;
        }
    }

    /// <summary>
    /// Sends audio data to Deepgram for speech-to-text recognition.
    /// </summary>
    /// <param name="audioBytes">The audio data in bytes (e.g. MP3/WAV).</param>
    /// <param name="contentType">Audio MIME type, e.g. "audio/mpeg" or "audio/wav".</param>
    /// <returns>Recognized transcript text.</returns>
    public async Task<string?> TranscribeAsync(byte[] audioBytes, string contentType = "mp3")
    {
        var url = "https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true";
        using var content = new ByteArrayContent(audioBytes);
        content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue($"audio/{contentType}");

        var response = await _httpClient.PostAsync(url, content);
        response.EnsureSuccessStatusCode();

        // get the response string
        var responseString = await response.Content.ReadAsStringAsync();

        // Parse transcript
        using var doc = JsonDocument.Parse(responseString);
        var root = doc.RootElement;


        try
        {
            var transcript = root
                .GetProperty("results")
                .GetProperty("channels")[0]
                .GetProperty("alternatives")[0]
                .GetProperty("transcript")
                .GetString();

            return transcript;
        }
        catch
        {
            return null;
        }

        // {
        //   "results": {
        //     "channels": [
        //       {
        //         "alternatives": [
        //           {
        //             "transcript": "This is a medium length text.",
        //             "confidence": 0.99930584,
        //             "words": [
        //               {"word": "this", "start": 0.16, "end": 0.56},
        //               {"word": "is", "start": 0.56, "end": 0.80},
        //               {"word": "a", "start": 0.80, "end": 0.96},
        //               {"word": "medium", "start": 0.96, "end": 1.44},
        //               {"word": "length", "start": 1.44, "end": 1.76},
        //               {"word": "text", "start": 1.76, "end": 2.24}
        //             ]
        //           }
        //         ]
        //       }
        //     ]
        //   }
        // }

    }
}
