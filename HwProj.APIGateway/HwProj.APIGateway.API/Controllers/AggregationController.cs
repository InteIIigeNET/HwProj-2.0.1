using System.Linq;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers
{
    public class AggregationController : ControllerBase
    {
        protected string? UserId =>
            Request.HttpContext.User.Claims
                .FirstOrDefault(claim => claim.Type.ToString() == "_id")
                ?.Value;
    }
}
