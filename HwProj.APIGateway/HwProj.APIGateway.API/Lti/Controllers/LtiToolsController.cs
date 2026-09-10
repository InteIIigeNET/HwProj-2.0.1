using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Lti.DTOs;
using HwProj.APIGateway.API.Lti.Services;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Lti.Controllers;

[Route("api/lti/tools")]
[ApiController]
public class LtiToolsController(ILtiToolService toolService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<LtiToolDto>), (int)HttpStatusCode.OK)]
    public ActionResult<IEnumerable<LtiToolDto>> GetAll()
    {
        var tools = toolService.GetAll();
        return Ok(tools);
    }

    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(LtiToolDto), (int)HttpStatusCode.OK)]
    public ActionResult<LtiToolDto> Get(string name)
    {
        var tool = toolService.GetByName(name);
        if (tool == null)
        {
            return NotFound();
        }

        return Ok(tool);
    }
}