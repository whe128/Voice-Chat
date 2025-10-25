using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Backend.Services;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RegisterController : ControllerBase
{
    [HttpPost] // .../api/register
    public async Task<IActionResult> RegisterAsync([FromBody] RegistRequest request)
    {
        Console.WriteLine($"Register attempt for user: {request.Email}");

        // check if username already exists
        var existingUser = await UserData.GetUserByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return StatusCode(409, "Username already exists."); // 409 Conflict
        }


        // call UserData to create new user
        var newUserResult = await UserData.RegisterUserAsync(
            request.Email,
            request.Password,
            ""
            );

        if (newUserResult == null)
        {
            return StatusCode(500, "Failed to create user.");
        }

        // create User object to return
        User user = new(
            newUserResult.Id.ToString(),
            newUserResult.Email!,
            newUserResult.Email!,
            newUserResult.AvatarUrl,
            newUserResult.LastLogin
        );

        return Ok(user);
    }
}
