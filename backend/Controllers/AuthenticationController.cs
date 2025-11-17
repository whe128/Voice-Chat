using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using Backend.Utils;

namespace Backend.Controllers;

public record AuthenticationRequest(string Email, string Password);

[ApiController]
[Route("api/[controller]")]
public class AuthenticationController : ControllerBase
{
    [HttpPost]     //.../api/authentication
    public async Task<IActionResult> AuthenticationAsync([FromBody] AuthenticationRequest request)
    {
        Logger.Log($"Authentication attempt for user: {request.Email}");

        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest("Email and password must be provided.");
        }

        // Handle guest auth
        if (string.Equals(request.Email, "guest", StringComparison.OrdinalIgnoreCase))
        {

            return Ok(new User(
                $"guest-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString()}",
                request.Email,
                request.Email,
                null,
                DateTime.UtcNow,
                "credentials",
                null,
                null
            ));
        }

        // handle credentials auth
        var (userResult, error) = await UserData.AuthenticateUserAsync(request.Email, request.Password);
        if (userResult == null)
        {
            return StatusCode(401, error);
        }


        User user = new(
            userResult.Id.ToString(),
            userResult.Email!,
            userResult.Email!,
            userResult.AvatarUrl,
            userResult.LastLogin,
            userResult.Provider,
            userResult.Language,
            userResult.Voice
        );
        return Ok(user);
    }
}
