using System;
using System.Net.Http;
using System.Net.NetworkInformation;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Backend.Services;

public class GeminiChat
{
    private static GeminiChat? _instance;
    private static readonly object _lock = new object();

    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    private GeminiChat()
    {
        _apiKey = Environment.GetEnvironmentVariable("GEMIMNI_API_KEY")
            ?? throw new Exception("Gemini API key not found in environment variables.");

        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("x-goog-api-key", _apiKey);
        _httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
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
        var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

        // 构建请求 JSON
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

        var response = await _httpClient.PostAsync(url, content);
        response.EnsureSuccessStatusCode();

        var jsonResponse = await response.Content.ReadAsStringAsync();

        // 解析返回 JSON
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
