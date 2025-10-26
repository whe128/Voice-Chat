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

        if (!context.Request.Headers.TryGetValue("accessKey", out var extractedAccessKey) ||
            extractedAccessKey != _accessKey)
        {
            context.Response.StatusCode = 404;
            return;
        }
        await _next(context);
    }

}

