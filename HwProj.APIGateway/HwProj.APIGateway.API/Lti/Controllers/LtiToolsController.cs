using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Lti.Models;
using HwProj.APIGateway.API.Lti.Services;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Lti.Controllers;

[Route("api/lti/tools")]
[ApiController]
public class LtiToolsController(ILtiToolService toolService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<LtiToolDto>), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<IEnumerable<LtiToolDto>>> GetAll()
    {
        var tools = await toolService.GetAllAsync();
        return Ok(tools);
    }

    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(LtiToolDto), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<LtiToolDto>> Get(long id)
    {
        var tool = await toolService.GetByIdAsync(id);
        if (tool == null)
        {
            return NotFound();
        }

        return Ok(tool);
    }
}