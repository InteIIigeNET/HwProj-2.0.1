using System.Net;
using System.Threading.Tasks;
using HwProj.CoursesService.Client;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.Result;
using HwProj.Models.Roles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CourseFiltersController : ControllerBase
    {
        private readonly ICoursesServiceClient _coursesClient;

        public CourseFiltersController(ICoursesServiceClient coursesClient)
        {
            _coursesClient = coursesClient;
        }

        [HttpPost("createExpertFilter")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(Result<long>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> CreateOrUpdateExpertCourseFilter(CreateCourseFilterViewModel model)
        {
            var result = await _coursesClient.CreateOrUpdateExpertCourseFilter(model);
            return Ok(result);
        }
    }
}