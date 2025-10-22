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

        if (!context.Request.Headers.TryGetValue("AccessKey", out var extractedAccessKey) ||
            extractedAccessKey != _accessKey)
        {
            context.Abort();
            return;
        }
        await _next(context);
    }

}

