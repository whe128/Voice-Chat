using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using Backend.Utils;

namespace Backend.Controllers;

public record RegistRequest(string Email, string Password, string Provider);

[ApiController]
[Route("api/[controller]")]
public class RegisterController : ControllerBase
{
    [HttpPost] // .../api/register
    public async Task<IActionResult> RegisterAsync([FromBody] RegistRequest request)
    {
        //Line($"Register attempt for user: {request.Email}");

        // check if username already exists
        var existingUser = await UserData.GetUserByEmailAsync(request.Email);
        if (existingUser != null)
        {
            Logger.Log($"Registration failed: username {request.Email} already exists.");
            return StatusCode(409, "Username already exists."); // 409 Conflict
        }


        // call UserData to create new user
        var newUserResult = await UserData.RegisterUserAsync(
            request.Email,
            request.Password,
            request.Provider,
            null
            );

        if (newUserResult == null)
        {
            Logger.Log("Registration failed: unable to create user.");
            return StatusCode(500, "Failed to create user.");
        }

        // create User object to return
        User user = new(
            newUserResult.Id.ToString(),
            newUserResult.Email!,
            newUserResult.Email!,
            newUserResult.AvatarUrl,
            newUserResult.LastLogin,
            newUserResult.Provider,
            newUserResult.Language,
            newUserResult.Voice
        );

        return Ok(user);
    }
}
