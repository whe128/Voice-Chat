using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Backend.Services;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LoginController : ControllerBase
{
    [HttpPost]     //.../api/login
    public async Task<IActionResult> LoginAsync([FromBody] LoginRequest request)
    {
        Console.WriteLine($"Login attempt for user: {request.Email}");
        var userResult = await UserData.AuthenticateUserAsync(request.Email, request.Password);
        if (userResult == null)
        {
            return StatusCode(401, "Invalid username or password.");
        }


        User user = new(
            userResult.Id.ToString(),
            userResult.Email!,
            userResult.Email!,
            userResult.AvatarUrl,
            userResult.LastLogin
        );
        return Ok(user);
    }
}
