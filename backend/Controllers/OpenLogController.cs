using Backend.Utils;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]

public class OpenLogController : ControllerBase
{
    // POST api/openLog?openLog={openLog}
    [HttpPost]
    public IActionResult SetOpenLog([FromQuery] string openLog)
    {
        Logger.Log($"Set open log to: {openLog}");
        if (string.IsNullOrEmpty(openLog))
        {
            return BadRequest(new { message = "openLog must be provided." });
        }

        if (openLog.Equals("true", StringComparison.CurrentCultureIgnoreCase))
        {
            Logger.IsEnabled = true;
        }
        else
        {
            Logger.IsEnabled = false;
        }

        return Ok();
    }

    // GET api/openLog
    [HttpGet]
    public IActionResult GetOpenLog()
    {
        Logger.Log($"Get open log status {Logger.IsEnabled}");
        return Ok(new { isEnabled = Logger.IsEnabled });
    }
}



