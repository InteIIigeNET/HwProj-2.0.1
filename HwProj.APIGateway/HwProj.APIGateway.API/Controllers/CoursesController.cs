using System.Net;
using System.Threading.Tasks;
using HwProj.CoursesService.Client;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers
{
    [Route("api/Courses/")]
    [ApiController]
    public class CoursesController : ControllerBase
    {
        private readonly ICoursesServiceClient _coursesClient;

        public CoursesController(ICoursesServiceClient coursesClient)
        {
            _coursesClient = coursesClient;
        }

        [HttpGet]
        [ProducesResponseType(typeof(CourseViewModel[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAllCourses()
        {
            var result = await _coursesClient.GetAllCourses();
            return Ok(result);
        }
        
        [HttpGet("{courseId}")]
        [ProducesResponseType(typeof(CourseViewModel), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCourseData(long courseId)
        {
            var result = await _coursesClient.GetCourseData(courseId);
            return result == null
                ? NotFound()
                : Ok(result) as IActionResult;
        }
        
        [HttpDelete("{courseId}")]
        public async Task<IActionResult> DeleteCourse(long courseId)
        {
            await _coursesClient.DeleteCourse(courseId);
            return Ok();
        }
        
        [HttpPost("create")]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> CreateCourse(CreateCourseViewModel model, [FromQuery] string mentorId)
        {
            var result = await _coursesClient.CreateCourse(model, mentorId);
            return Ok(result);
        }
    }
}
