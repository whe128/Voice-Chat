namespace Backend.Models;

public static class Formatter
{
    /// <summary>
    /// Format a user message into a structured prompt for the AI.
    /// </summary>
    public static string ChatFormatPrompt(string userMessage, int maxWords = 50, string language = "English")
    {
        return $@"
You are an AI assistant.
Analyze the user's message and return a JSON object with two fields:
1. replyMessage: an English response to the user's message (no more than {maxWords} words)
2. grammarError: a string describing any grammar mistakes found in the user's message in {language}.
    - If no grammar mistakes, return an empty string """".

User message: ""{userMessage}""

return Expected JSON format:
{{
    ""replyMessage"": ""<your reply here>"",
    ""grammarError"": ""<grammar issue or empty>""
}}
";
    }


    public static string TranslationFormatPrompt(string userMessage, string targetLanguage = "English")
    {
        if (targetLanguage.ToLower() == "english")
        {
            // no need to translate
            return userMessage;
        }
        return $@"
You are an AI translation assistant.
Please translate the original text into {targetLanguage}.
Keep the meaning accurate, natural, and fluent.
Do not add extra commentary.

Original text: ""{userMessage}""

return Expected JSON format:
{{
    ""translatedText"": ""<your translation here>""
}}
";

    }

}
