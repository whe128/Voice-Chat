using Microsoft.AspNetCore.Mvc;
using Backend.Services;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]

public class DeleteAccountController : ControllerBase
{
    // DELETE api/deleteAccount/{userId}
    [HttpDelete("{email}")]
    public async Task<IActionResult> DeleteAccount(string email)
    {
        Console.WriteLine($"Delete account attempt for user: {email}");
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



