using Microsoft.AspNetCore.Mvc;
using Backend.Middleware;
using Backend.Utils;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConnectionController : ControllerBase
    {
        // generate a temporary connection token 30 seconds valid
        // do not require access key, middleware has handled that

        [HttpPost]
        // POST /api/connection
        public IActionResult GetConnectionToken()
        {
            var tempKey = AccessKeyMiddleware.GenerateTemporaryKey();
            Logger.Log($"Generated temporary connection token: {tempKey}");
            return Ok(new { tempKey, expire = AccessKeyMiddleware.tempKeyTime });
        }
    }
}
