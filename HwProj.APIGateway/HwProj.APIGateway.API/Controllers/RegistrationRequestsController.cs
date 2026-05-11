using System.Net;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
using HwProj.Models.CoursesService.DTO;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.Result;
using HwProj.Models.Roles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RegistrationRequestsController(
        ICoursesServiceClient coursesClient,
        IAuthServiceClient authServiceClient)
        : AggregationController(authServiceClient)
    {
        [HttpPost("init")]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Init([FromBody] InitRegistrationRequestViewModel model)
        {
            var result = await coursesClient.InitRegistrationRequest(model);
            return Ok(result);
        }
        
        [HttpPost("confirm")]
        [ProducesResponseType(typeof(Result<long>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Confirm([FromBody] ConfirmRegistrationRequestViewModel model)
        {
            var result = await coursesClient.ConfirmRegistrationRequest(model);
            return Ok(result);
        }

        [HttpGet("course/{courseId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(Result<RegistrationRequestDto[]>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCourseRequests(long courseId)
        {
            var result = await coursesClient.GetCourseRegistrationRequests(courseId);
            return Ok(result);
        }

        [HttpGet("general")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(Result<RegistrationRequestDto[]>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetGeneralRequests()
        {
            var result = await coursesClient.GetGeneralRegistrationRequests();
            return Ok(result);
        }

        [HttpPost("{requestId}/approve")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Approve(long requestId)
        {
            var result = await coursesClient.ApproveRegistrationRequest(requestId);
            return Ok(result);
        }

        [HttpPost("{requestId}/reject")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Reject(long requestId, [FromBody] ReviewRegistrationRequestViewModel model)
        {
            var result = await coursesClient.RejectRegistrationRequest(requestId, model);
            return Ok(result);
        }
    }   
}