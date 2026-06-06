using System.Net;
using System.Threading.Tasks;
using HwProj.Common.Net8;
using HwProj.CoursesService.API.Services;
using HwProj.Models.CoursesService.DTO;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.Result;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CoursesService.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RegistrationRequestsController : Controller
    {
        private readonly IRegistrationRequestsService _service;

        public RegistrationRequestsController(IRegistrationRequestsService service)
        {
            _service = service;
        }

        [HttpPost("init")]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Init([FromBody] InitRegistrationRequestViewModel model)
        {
            var result = await _service.InitRequestAsync(model);
            return Ok(result);
        }
        
        [HttpPost("confirm")]
        [ProducesResponseType(typeof(Result<long>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Confirm([FromBody] ConfirmRegistrationRequestViewModel model)
        {
            var result = await _service.ConfirmRequestAsync(model.Token);
            return Ok(result);
        }

        [HttpGet("course/{courseId}")]
        [ProducesResponseType(typeof(Result<RegistrationRequestDto[]>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCourseRequests(long courseId)
        {
            var reviewerId = Request.GetUserIdFromHeader();
            if (string.IsNullOrWhiteSpace(reviewerId))
            {
                return Unauthorized();
            }

            var result = await _service.GetCourseRequestsAsync(courseId, reviewerId);
            return Ok(result);
        }

        [HttpGet("general")]
        [ProducesResponseType(typeof(Result<RegistrationRequestDto[]>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetGeneralRequests()
        {
            var reviewerId = Request.GetUserIdFromHeader();
            if (string.IsNullOrWhiteSpace(reviewerId))
            {
                return Unauthorized();
            }
            
            var result = await _service.GetGeneralRequestsAsync(reviewerId);
            return Ok(result);
        }

        [HttpPost("{requestId}/approve")]
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Approve(long requestId)
        {
            var reviewerId = Request.GetUserIdFromHeader();
            
            if (string.IsNullOrWhiteSpace(reviewerId))
            {
                return Unauthorized();
            }

            var result = await _service.ApproveAsync(requestId, reviewerId);
            return Ok(result);
        }
        
        [HttpPost("{requestId}/reject")]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Reject(long requestId, [FromBody] ReviewRegistrationRequestViewModel model)
        {
            var reviewerId = Request.GetUserIdFromHeader();
            if (string.IsNullOrWhiteSpace(reviewerId))
            {
                return Unauthorized();
            }

            var result = await _service.RejectAsync(requestId, reviewerId, model?.RejectReason);
            return Ok(result);
        }
    }
}