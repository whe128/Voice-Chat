using Backend.Middleware;
using DotNetEnv;
using Backend.WebSocketCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});
var app = builder.Build();

Env.Load();


var accessKey = Environment.GetEnvironmentVariable("FRONTEND_ACCESS_KEY")
?? throw new Exception("Access key not found in environment variables.");

// Use the AccessKeyMiddleware
app.Use(async (context, next) =>
{
    var middleware = new AccessKeyMiddleware(accessKey, next);
    await middleware.InvokeAsync(context);
});
app.UseWebSockets();
// Map the WebSocket endpoint
app.Map("/ws", AppWebSocketManager.HandleConnectionAsync);

app.MapControllers();

app.Run();
