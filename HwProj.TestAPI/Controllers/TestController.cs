using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.TestAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestController : ControllerBase
    {
        [HttpGet("get")]
        public ActionResult<List<string>> Get()
        {
            string name = User.FindFirst("_name").Value;
            string surname = User.FindFirst("_surname").Value;
            string email = User.FindFirst("_email").Value;
            string id = User.FindFirst("_id").Value;

            return new List<string> { name, surname, email, id };
        }
    }
}
