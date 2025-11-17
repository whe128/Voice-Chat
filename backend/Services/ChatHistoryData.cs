using Backend.Models;

namespace Backend.Services;

using Supabase.Postgrest;
public class ChatHistoryData
{
    public static async Task<bool> AddMessageAsync(Guid userId, string message, bool isSendOut)
    {
        // not adding empty messages to the database
        if (string.IsNullOrEmpty(message))
        {
            return false;
        }

        try
        {
            var client = await DataService.GetClientAsync();

            var chat = new ChatHistoryTable
            {
                UserId = userId,
                Message = message,
                IsSendOut = isSendOut,
            };
            var result = await client.From<ChatHistoryTable>().Insert(chat);
            return result.Models != null && result.Models.Count > 0;
        }
        catch
        {
            return false;
        }
    }

    public static async Task<List<ChatMessage>> GetUserHistoryAsync(Guid userId)
    {
        try
        {
            var client = await DataService.GetClientAsync();

            // Assuming your client has a Table<T>() interface like Supabase
            var result = await client
                .From<ChatHistoryTable>()
                .Where(c => c.UserId == userId)
                .Order(c => c.Time, Constants.Ordering.Ascending)
                .Get();

            return [
                ..result.Models.Select(
                    chat => new ChatMessage(
                    chat.Id.ToString(),
                    chat.Message ?? "",
                    chat.IsSendOut
                )
            )];
        }
        catch
        {
            return []; // return empty list on failure
        }
    }
}
