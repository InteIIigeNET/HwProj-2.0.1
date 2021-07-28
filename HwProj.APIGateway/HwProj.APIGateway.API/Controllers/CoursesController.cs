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
            return Ok(result);
        }
    }
}
