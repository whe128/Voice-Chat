namespace Backend.Controllers;

using Backend.Models;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class LoginController : ControllerBase
{
    [HttpPost]     //.../api/login
    public IActionResult Login([FromBody] LoginRequest request)
    {
        if (request.Username == "test" && request.Password == "test")
        {
            return Ok(new User(
                Id: "1",
                Name: "Test User",
                Email: "test@test",
                Image: "https://example.com/image.png"));
        }
        return Ok(null);
    }
}
