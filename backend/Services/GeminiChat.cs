using System.Text;
using System.Text.Json;

namespace Backend.Services;

public class GeminiChat
{
    private static GeminiChat? _instance;
    private static readonly object _lock = new();
    private readonly HttpClient _httpClient;
    private readonly string _apiUrl;

    private GeminiChat()
    {
        _apiUrl = Environment.GetEnvironmentVariable("GEMIMNI_API_URL")
            ?? throw new Exception("Gemini API URL not found in environment variables.");

        string apiKey = Environment.GetEnvironmentVariable("GEMIMNI_API_KEY")
            ?? throw new Exception("Gemini API key not found in environment variables.");
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("x-goog-api-key", apiKey);
    }

    public static GeminiChat Instance
    {
        get
        {
            if (_instance == null)
            {
                lock (_lock)
                {
                    if (_instance == null)
                    {
                        _instance = new GeminiChat();
                    }
                }
            }
            return _instance;
        }
    }

    /// <summary>
    /// Sends a prompt to Google Gemini and returns the generated text.
    /// </summary>
    /// <param name="prompt">The input message to Gemini.</param>
    /// <returns>Generated text from Gemini.</returns>
    public async Task<string?> SendMessageAsync(string prompt)
    {
        if (prompt.Trim() == "")
        {
            return "{\"replyMessage\": \"Hello, how can I assist you today?\", \"grammarError\": \"\"}";
        }
        // construct request body
        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            }
        };

        var jsonRequest = JsonSerializer.Serialize(requestBody);
        using var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync(_apiUrl, content);
        response.EnsureSuccessStatusCode();

        var jsonResponse = await response.Content.ReadAsStringAsync();

        // parse JSON
        using var doc = JsonDocument.Parse(jsonResponse);
        var root = doc.RootElement;

        try
        {
            var reply = root.
                            GetProperty("candidates")[0].
                            GetProperty("content").
                            GetProperty("parts")[0].
                            GetProperty("text").
                            GetString();

            return reply;
        }
        catch
        {
            return null;
        }
    }
}
