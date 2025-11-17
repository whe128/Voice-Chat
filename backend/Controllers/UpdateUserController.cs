using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using Backend.Utils;

namespace Backend.Controllers;


[ApiController]
[Route("api/[controller]")]

public class UpdateUserController : ControllerBase
{
    // POST api/updateUser/{id}?attribute={attribute}&value={value}
    [HttpPost("{id}")]
    public async Task<IActionResult> UpdateUserAsync(string id,
                                            [FromQuery] string attribute,
                                            [FromQuery] string value)
    {

        Logger.Log($"attempt to update user: {id}, attribute: {attribute}, value: {value}");

        if (string.IsNullOrEmpty(id) || string.IsNullOrEmpty(attribute) || string.IsNullOrEmpty(value))
        {
            return BadRequest(new { message = "Id, attribute, and value must be provided." });
        }

        if (id.StartsWith("guest", StringComparison.OrdinalIgnoreCase))
        {
            return Ok();
        }

        try
        {
            switch (attribute.ToLower())
            {
                case "avatar_url":
                    await UserData.UpdateAvatarUserAsync(Guid.Parse(id), value);
                    break;

                case "language":
                    await UserData.UpdateLanguageUserAsync(Guid.Parse(id), value);
                    break;
                case "voice":
                    await UserData.UpdateVoiceUserAsync(Guid.Parse(id), value);
                    break;

                default:
                    return BadRequest(new { message = "Invalid attribute." });
            }

            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Internal server error.", error = ex.Message });
        }
    }
}



