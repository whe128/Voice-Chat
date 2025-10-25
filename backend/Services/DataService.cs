using Supabase;
using Supabase.Postgrest.Models;

namespace Backend.Services;

public class DataService
{
    private static readonly SemaphoreSlim _lock = new(1);

    private static Client? _client;

    private DataService()
    {
    }

    public static async Task<Client> GetClientAsync()
    {
        if (_client != null)
        {
            return _client;
        }
        await _lock.WaitAsync();
        try
        {
            if (_client != null)
            {
                return _client;
            }

            var url = Environment.GetEnvironmentVariable("SUPABASE_URL")
                        ?? throw new Exception("Supabase URL not found in environment variables.");
            var key = Environment.GetEnvironmentVariable("SUPABASE_KEY")
                        ?? throw new Exception("Supabase Key not found in environment variables.");

            var options = new SupabaseOptions
            {
                AutoConnectRealtime = true
            };
            //1. create client
            _client = new Client(url, key, options);
            //2. initialize client
            await _client.InitializeAsync();
            // create client,
            return _client;

        }
        finally
        {
            _lock.Release();
        }
    }


}
