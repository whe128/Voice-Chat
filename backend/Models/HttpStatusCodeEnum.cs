namespace Backend.Models;

public enum HttpStatusCodeEnum
{
    // 2xx success
    OK = 200,
    Created = 201,
    Accepted = 202,
    NoContent = 204,

    // 4xx client error
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    MethodNotAllowed = 405,
    RequestTimeout = 408,
    UnsupportedMediaType = 415,

    // 5xx server error
    InternalServerError = 500,
    NotImplemented = 501,
    BadGateway = 502,
    ServiceUnavailable = 503,
    GatewayTimeout = 504,

    // 1xx information
    Continue = 100,
    SwitchingProtocols = 101
}
