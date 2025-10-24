using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
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

        // Extract user ID from query string (e.g., ws://localhost:5000/ws?userId=123)
        var userId = context.Request.Query["userId"].ToString();
        if (string.IsNullOrEmpty(userId))
        {
            context.Response.StatusCode = 401; // Unauthorized
            return;
        }

        // Accept the WebSocket connection
        var webSocket = await context.WebSockets.AcceptWebSocketAsync();

        // Store the connection for later use
        _userSockets[userId] = webSocket;


        Console.WriteLine($"✅ User: {userId} connected. Total connections: {_userSockets.Count}");

        // Start receiving messages from the client
        await ReceiveLoopAsync(userId, webSocket);
    }

    /// <summary>
    /// Continuously receives messages from a connected WebSocket client.
    /// </summary>
    private static async Task ReceiveLoopAsync(string userId, WebSocket socket)
    {
        var buffer = new byte[1024 * 1024 * 10];

        try
        {
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
                    Console.WriteLine($"❌ User: {userId} initiated close: {result.CloseStatus} - {result.CloseStatusDescription}");
                    break;
                }

                Console.WriteLine($"📨 Received {result.Count} bytes from {userId}   messageType: {result.MessageType}");
                // Example: Echo message back to the sender
                await WebSocketRequestHandler.HandleMessageAsync(userId, socket, buffer, result.MessageType, result.Count);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️ WebSocket error for {userId}: {ex.Message}");
        }
        finally
        {
            // Clean up user connection when disconnected
            _userSockets.TryRemove(userId, out _);

            // Gracefully close the socket if still open
            if (socket.State == WebSocketState.Open || socket.State == WebSocketState.CloseReceived)
                await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed", CancellationToken.None);

            Console.WriteLine($"❌ User {userId} disconnected");

            // finally close the websocket
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

