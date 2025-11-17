using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using Backend.Models;
using Backend.Utils;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]

public class GetUserInfoController : ControllerBase
{
    // POST api/getUserInfo/{id}
    [HttpPost("{id}")]
    public async Task<IActionResult> GetUserInfoAsync(string id)
    {
        Logger.Log($"attempt to get user Info: {id}");

        // Handle guest get userInfo
        if (id.StartsWith("guest", StringComparison.OrdinalIgnoreCase))
        {
            return Ok(new User(
                $"guest-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString()}",
                "guest",
                "guest",
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
            var existingUser = await UserData.GetUserByidAsync(Guid.Parse(id));
            if (existingUser == null)
            {
                Logger.Log($"getUser failed: id {id} does not exist.");
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



