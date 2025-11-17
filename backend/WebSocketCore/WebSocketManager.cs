using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using Backend.Services;
using Backend.Utils;

namespace Backend.WebSocketCore;

/// <summary>
/// A centralized manager for handling all active WebSocket connections from frontend clients.
/// </summary>
public class AppWebSocketManager
{
    // Stores all active WebSocket connections.
    // Key: userId (string), Value: WebSocket instance
    private static readonly ConcurrentDictionary<string, WebSocket> _userSockets = new();

    /// <summary>
    /// Handles an incoming WebSocket connection request.
    /// </summary>
    public static async Task HandleConnectionAsync(HttpContext context)
    {
        // Validate that the request is a WebSocket upgrade request
        if (!context.WebSockets.IsWebSocketRequest)
        {
            context.Response.StatusCode = 400; // Bad Request
            return;
        }

        // Extract user ID from query string (e.g., ws://localhost:5000/ws)
        var userId = context.Request.Query["user_id"].ToString();
        var userEmail = context.Request.Query["user_email"].ToString();
        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(userEmail))
        {
            context.Response.StatusCode = 401; // Unauthorized
            return;
        }

        // Accept the WebSocket connection
        var webSocket = await context.WebSockets.AcceptWebSocketAsync();


        if (_userSockets.TryGetValue(userId, out var existingSocket))
        {
            // Close existing connection if user reconnects
            if (existingSocket.State == WebSocketState.Open)
            {
                await existingSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Replaced by new connection", CancellationToken.None);
            }
        }
        // Store the connection for later use
        _userSockets[userId] = webSocket;


        Logger.Log($"✅ User:{userEmail}:[{userId}] connected. Total connections: {_userSockets.Count}");

        // Start receiving messages from the client
        await ReceiveLoopAsync(userId, userEmail, webSocket);
    }

    /// <summary>
    /// Continuously receives messages from a connected WebSocket client.
    /// </summary>
    private static async Task ReceiveLoopAsync(string userId, string userEmail, WebSocket socket)
    {
        var buffer = new byte[1024 * 1024 * 10];

        try
        {
            // On connection, mark user as online, and login
            if (!userEmail.Equals("guest", StringComparison.CurrentCultureIgnoreCase))
            {
                await UserData.UpdateLastLoginUserAsync(Guid.Parse(userId));
                await UserData.UpdateIsOnlineUserAsync(Guid.Parse(userId), true);
            }

            // Continuously listen until the client closes the connection
            while (socket.State == WebSocketState.Open)
            {
                var result = await socket.ReceiveAsync(
                    new ArraySegment<byte>(buffer),
                    CancellationToken.None
                );

                // If client requests to close, break out of the loop
                if (result.CloseStatus.HasValue)
                {
                    Logger.Log($"❌ User:{userEmail}:[{userId}] initiated close: {result.CloseStatus} - {result.CloseStatusDescription}");
                    break;
                }

                Logger.Log($"📨 Received {result.Count} bytes from User:{userEmail}:[{userId}]  messageType: {result.MessageType}");
                // Example: Echo message back to the sender

                try
                {
                    await WebSocketRequestHandler.HandleMessageAsync(userId, userEmail, socket, buffer, result.MessageType, result.Count);
                }
                catch (Exception handlerEx)
                {
                    // record the error, but keep the connection alive
                    Logger.Log($"⚠️ Error handling message for User:{userEmail}:[{userId}]: {handlerEx.Message}");

                    // send error message back to user
                    try
                    {
                        var errorMessage = System.Text.Json.JsonSerializer.Serialize(new
                        {
                            type = "error",
                            message = "Failed to process your request",
                            details = handlerEx.Message
                        });

                        await SendTextToUserAsync(socket, errorMessage);
                    }
                    catch (Exception sendEx)
                    {
                        Logger.Log($"⚠️ Failed to send error message: {sendEx.Message}");
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Logger.Log($"⚠️ WebSocket error for User:{userEmail}:[{userId}]: {ex.Message}");
        }
        finally
        {
            // On exit, mark user as offline
            if (!userEmail.Equals("guest", StringComparison.CurrentCultureIgnoreCase))
            {
                await UserData.UpdateIsOnlineUserAsync(Guid.Parse(userId), false);
            }

            // Clean up user connection when disconnected
            _userSockets.TryRemove(userId, out _);

            // Gracefully close the socket if still open
            if (socket.State == WebSocketState.Open || socket.State == WebSocketState.CloseReceived)
                await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed", CancellationToken.None);

            Logger.Log($"❌ User:{userEmail}:[{userId}] disconnected");

        }
    }

    /// <summary>
    /// Sends a message to a specific user if their WebSocket is open.
    /// </summary>
    public static async Task SendTextToUserAsync(WebSocket socket, string message)
    {
        if (socket != null && socket.State == WebSocketState.Open)
        {
            var bytes = Encoding.UTF8.GetBytes(message);
            await socket.SendAsync(
                new ArraySegment<byte>(bytes),
                WebSocketMessageType.Text,
                true,
                CancellationToken.None
            );
        }
    }

    /// <summary>
    /// Sends binary data (e.g., audio) to a WebSocket client.
    /// </summary>
    public static async Task SendBinaryToUserAsync(WebSocket socket, byte[] data)
    {
        if (socket != null && socket.State == WebSocketState.Open)
        {
            await socket.SendAsync(
                new ArraySegment<byte>(data),
                WebSocketMessageType.Binary,
                true, // true as the final fragment
                CancellationToken.None
            );
        }
    }

    /// <summary>
    /// Broadcasts a message to all connected users.
    /// </summary>
    public static async Task BroadcastAsync(string message)
    {
        var bytes = Encoding.UTF8.GetBytes(message);
        foreach (var pair in _userSockets)
        {
            var socket = pair.Value;
            if (socket.State == WebSocketState.Open)
            {
                await socket.SendAsync(
                    new ArraySegment<byte>(bytes),
                    WebSocketMessageType.Text,
                    true,
                    CancellationToken.None
                );
            }
        }
    }
}

