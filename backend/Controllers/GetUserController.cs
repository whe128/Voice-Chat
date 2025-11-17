using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using Backend.Models;
using Backend.Utils;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]

public class GetUserController : ControllerBase
{
    // POST api/getUser/{email}
    [HttpPost("{email}")]
    public async Task<IActionResult> GetUserAsync(string email)
    {
        Logger.Log($"attempt to get user: {email}");

        // Handle guest get user
        if (string.Equals(email, "guest", StringComparison.OrdinalIgnoreCase))
        {
            return Ok(new User(
                $"guest-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString()}",
                email,
                email,
                null,
                DateTime.UtcNow,
                "credentials",
                null,
                null
            ));
        }

        try
        {
            // check if username already exists
            var existingUser = await UserData.GetUserByEmailAsync(email);
            if (existingUser == null)
            {
                Logger.Log($"getUser failed: username {email} does not exist.");
                return StatusCode(404, "User not found.");
            }

            // create User object to return
            User user = new(
                existingUser.Id.ToString(),
                existingUser.Email!,
                existingUser.Email!,
                existingUser.AvatarUrl,
                existingUser.LastLogin,
                existingUser.Provider,
                existingUser.Language,
                existingUser.Voice);

            return Ok(user);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Internal server error.", error = ex.Message });
        }
    }
}



