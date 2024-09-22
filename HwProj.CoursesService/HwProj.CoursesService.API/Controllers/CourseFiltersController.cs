using System.Threading.Tasks;
using HwProj.CoursesService.API.Services;
using HwProj.Models.CoursesService;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CoursesService.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CourseFiltersController : Controller
    {
        private readonly ICourseFilterService _courseFilterService;

        public CourseFiltersController(ICourseFilterService courseFilterService)
        {
            _courseFilterService = courseFilterService;
        }

        [HttpPost("createExpertFilter")]
        public async Task<IActionResult> CreateCourseFilter([FromBody] CreateCourseFilterModel courseFilterModel)
        {
            var result = await _courseFilterService.CreateOrUpdateExpertFilter(courseFilterModel);
            return Ok(result);
        }
    }
}