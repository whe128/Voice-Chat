using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Backend.Models;

namespace Backend.Services;

/// <summary>
/// API response model
/// </summary>
public class NiuApiResponse
{
    public required string From { get; set; }
    public required string To { get; set; }
    public required string TgtText { get; set; }

};

public class NiuTranslation
{
    private static readonly Dictionary<string, string> LANGUAGE_ENCODE = new()
    {
        {"auto", "auto" },
        { "Chinese", "zh" },
        { "Japanese", "ja" },
        { "Korean", "ko" },
        { "Vietnamese", "vi" },
        { "Thai", "th" },
        { "Russian", "ru" },
        { "Hindi", "hi" },
        { "Arabic", "ar" },
        { "Malay", "ml" },
        { "Italian", "it" },
        { "Portuguese", "pt" },
        { "Greek", "el" },
        { "Brazilian", "pt-BR" },
        { "Swahili", "sw" },
        { "French", "fr" },
        { "Spanish", "es" },
        { "Dutch", "nl" },
        { "Turkish", "tr" },
        { "Swedish", "sv" },
        { "German", "de" },
        { "English", "en" },
    };
    private static NiuTranslation? _instance;
    private static readonly object _lock = new();
    private readonly HttpClient _httpClient;
    private readonly string _apiUrl;
    private readonly string _apiKey;
    private readonly string _appId;

    private NiuTranslation()
    {
        _apiUrl = Environment.GetEnvironmentVariable("NIU_TRANSLATION_API_URL")
            ?? throw new Exception("Niu Translation API URL not found in environment variables.");

        _apiKey = Environment.GetEnvironmentVariable("NIU_TRANSLATION_API_KEY")
            ?? throw new Exception("Niu Translation API key not found in environment variables.");
        _httpClient = new HttpClient();

        _appId = Environment.GetEnvironmentVariable("NIU_TRANSLATION_APP_ID")
            ?? throw new Exception("Niu Translation APPID not found in environment variables.");

        _httpClient = new HttpClient();
    }

    public static NiuTranslation Instance
    {
        get
        {
            if (_instance == null)
            {
                lock (_lock)
                {
                    _instance ??= new NiuTranslation();
                }
            }
            return _instance;
        }
    }

    /// <summary>
    /// getnerate string (authStr)
    /// step：
    /// 1. put all parameters in order
    /// 2. use MD5 to encrypt the concatenated string
    /// </summary>
    private string GenerateAuthStr(Dictionary<string, string> parameters)
    {
        // add api key to parameters
        var paramsWithKey = new Dictionary<string, string>(parameters)
        {
            ["apikey"] = _apiKey
        };

        // filter out empty values and sort by key
        var filteredParams = paramsWithKey
            .Where(kvp => !string.IsNullOrEmpty(kvp.Value))
            .OrderBy(kvp => kvp.Key, StringComparer.Ordinal);

        // use the Ascii order to concatenate parameters
        var paramStr = string.Join("&",
            filteredParams.Select(kvp => $"{kvp.Key}={kvp.Value}"));

        // MD5 encryption
        var hashBytes = MD5.HashData(Encoding.UTF8.GetBytes(paramStr));
        return Convert.ToHexStringLower(hashBytes);
    }

    /// <summary>
    /// translate text
    /// </summary>
    /// <param name="text">the text needs to be translated</param>
    /// <param name="ToLanguage">source language</param>
    /// <param name="toLanguage">target language</param>
    /// <param name="termLibraryId">dictionationary (optional)</param>
    /// <param name="memoryLibraryId">memeory (optional)</param>
    /// <returns>translation result</returns>
    public async Task<string> TranslateAsync(
        string text,
        string toLanguage,
        string? FromLanguage = "auto",
        string? termLibraryId = null,
        string? memoryLibraryId = null)
    {
        if (string.IsNullOrEmpty(text))
            throw new ArgumentNullException("Empty text to translate.");

        if (!LANGUAGE_ENCODE.ContainsKey(toLanguage))
            throw new ArgumentException("Unsupported target language.", nameof(toLanguage));

        try
        {
            // generate timestamp
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();

            // bulid parameters
            var parameters = new Dictionary<string, string>
            {
                ["from"] = LANGUAGE_ENCODE[FromLanguage ?? "auto"],
                ["to"] = LANGUAGE_ENCODE[toLanguage ?? "auto"],
                ["srcText"] = text,
                ["appId"] = _appId,
                ["timestamp"] = timestamp
            };

            // optional parameters
            if (!string.IsNullOrEmpty(termLibraryId))
                parameters["termLibraryId"] = termLibraryId;
            if (!string.IsNullOrEmpty(memoryLibraryId))
                parameters["memoryLibraryId"] = memoryLibraryId;

            // generate authStr
            var authStr = GenerateAuthStr(parameters);
            parameters["authStr"] = authStr;

            // send post request
            var json = JsonSerializer.Serialize(parameters);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(_apiUrl, content);
            response.EnsureSuccessStatusCode();

            var responseJson = await response.Content.ReadAsStringAsync();

            var result = JsonSerializer.Deserialize<NiuApiResponse>(responseJson, JsonSettings.CamelCase);

            return result?.TgtText ?? "";
        }
        catch
        {
            return "";
        }
    }
}
