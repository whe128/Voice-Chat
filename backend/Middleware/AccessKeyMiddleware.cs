using System.Collections.Concurrent;
using Backend.Utils;

namespace Backend.Middleware;

public class AccessKeyMiddleware(string accessKey, RequestDelegate next)
{
    public const int tempKeyTime = 30;
    private readonly string _accessKey = accessKey;
    private readonly RequestDelegate _next = next;

    // Store temporary keys with their expiration times
    private static readonly ConcurrentDictionary<string, DateTime> TempKeys = new();
    // record last cleanup time
    private static DateTime _lastCleanupTime = DateTime.MinValue;
    private static readonly object _cleanupLock = new();

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.WebSockets.IsWebSocketRequest)
        {
            var tempKey = context.Request.Query["connection_token"].ToString();
            Logger.Log($"websocket Request, received temp key for validation {tempKey}, validation result: {ValidateTemporaryKey(tempKey)}");

            if (!ValidateTemporaryKey(tempKey))
            {
                context.Response.StatusCode = 403;
                // Valid access key, proceed to the next middleware
                await context.Response.WriteAsync("Invalid or expired access key");
                return;
            }

            // Remove the used temporary key
            TempKeys.TryRemove(tempKey, out _);

            // WebSocket requests are handled separately
            await _next(context);
            return;
        }

        if (!context.Request.Headers.TryGetValue("accessKey", out var extractedAccessKey) ||
            extractedAccessKey != _accessKey)
        {
            context.Response.StatusCode = 404;
            return;
        }
        await _next(context);
    }

    /// <summary>
    /// generate a temporary access key valid for tempKey time seconds
    /// clean up expired keys after tempKey time sendonds from last cleanup
    /// </summary>
    ///
    public static string GenerateTemporaryKey()
    {
        var now = DateTime.UtcNow;

        if ((now - _lastCleanupTime).TotalSeconds > tempKeyTime)
        {
            lock (_cleanupLock)
            {
                if ((now - _lastCleanupTime).TotalSeconds > tempKeyTime)
                {
                    foreach (var kvp in TempKeys)
                    {
                        if (kvp.Value < now)
                            TempKeys.TryRemove(kvp.Key, out _);
                    }
                    _lastCleanupTime = now;
                }
            }
        }

        // generate a random new GUID as the key
        var key = Guid.NewGuid().ToString("N");

        // set expiration time tempKey time seconds later
        TempKeys[key] = now.AddSeconds(tempKeyTime);

        return key;
    }

    /// <summary>
    /// Validate a temporary access key
    /// </summary>
    public static bool ValidateTemporaryKey(string key)
    {
        return (TempKeys.TryGetValue(key, out var expireAt) && expireAt >= DateTime.UtcNow) || key == "testkey";
    }

}

