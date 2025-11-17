using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using Backend.Utils;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]

public class DeleteAccountController : ControllerBase
{
    // DELETE api/deleteAccount/{email}
    [HttpDelete("{email}")]
    public async Task<IActionResult> DeleteAccountAsync(string email)
    {
        Logger.Log($"Delete account attempt for user: {email}");


        // Handle guest get user
        if (string.Equals(email, "guest", StringComparison.OrdinalIgnoreCase))
        {
            return Ok(new { message = "guest user Do not need to delete." });
        }


        try
        {
            // first, verify user exists
            var userResult = await UserData.GetUserByEmailAsync(email);

            if (userResult == null)
                return NotFound(new { message = "User not found." });

            // delete user
            await UserData.DeleteUserAsync(userResult.Id);

            return Ok(new { message = "User account deleted successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Internal server error.", error = ex.Message });
        }
    }
}



