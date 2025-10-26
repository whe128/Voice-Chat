namespace Backend.Middleware;

public class AccessKeyMiddleware
{
    private readonly string _accessKey;
    private readonly RequestDelegate _next;

    public AccessKeyMiddleware(string accessKey, RequestDelegate next)
    {
        _accessKey = accessKey;
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {

        var path = context.Request.Path.Value ?? "";
        var method = context.Request.Method;
        var userAgent = context.Request.Headers["User-Agent"].ToString();
        var host = context.Request.Host.ToString();
        var scheme = context.Request.Scheme;

        // 记录每个请求的详细信息
        var logMessage = $@"
========== REQUEST ==========
Time: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}
Method: {method}
Path: {path}
Host: {host}
Scheme: {scheme}
User-Agent: {userAgent}
Headers: {string.Join(", ", context.Request.Headers.Select(h => $"{h.Key}={h.Value.ToString().Substring(0, Math.Min(h.Value.ToString().Length, 50))}"))}
RemoteIP: {context.Connection.RemoteIpAddress}
============================";

        // var path = context.Request.Path.Value;
        // if (path == "/")
        // {
        //     await _next(context);
        //     return;
        // }

        // if (!context.Request.Headers.TryGetValue("accessKey", out var extractedAccessKey) ||
        //     extractedAccessKey != _accessKey)
        // {
        //     context.Abort();
        //     return;
        // }
        await _next(context);
    }

}

