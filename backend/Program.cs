using Backend.Middleware;
using DotNetEnv;
using Backend.WebSocketCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
            options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowVercel", policy =>
    {
        policy.WithOrigins(
                "https://voice-chat-pearl.vercel.app/",
                "http://localhost:3000"
              )
              .AllowAnyMethod()
              .AllowAnyHeader()
              .WithHeaders("Content-Type", "accessKey")
              .SetIsOriginAllowedToAllowWildcardSubdomains();
    });
});


var app = builder.Build();

Env.Load();

var accessKey = Environment.GetEnvironmentVariable("FRONTEND_ACCESS_KEY")
?? throw new Exception("Access key not found in environment variables.");


app.UseRouting();

app.UseCors("AllowVercel");


app.UseWebSockets();

// Use the AccessKeyMiddleware
app.Use(async (context, next) =>
{
    var middleware = new AccessKeyMiddleware(accessKey, next);
    await middleware.InvokeAsync(context);
});


// Map the WebSocket endpoint
app.Map("/ws", AppWebSocketManager.HandleConnectionAsync);

app.MapControllers();

var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
{
    app.Run($"http://0.0.0.0:{port}");
}
else
{
    app.Run();
}
