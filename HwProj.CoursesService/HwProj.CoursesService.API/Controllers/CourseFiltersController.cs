using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.API.Filters;
using HwProj.CoursesService.API.Services;
using HwProj.Models.CoursesService;
using HwProj.Models.CoursesService.DTO;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CoursesService.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CourseFiltersController : Controller
    {
        private readonly ICourseFilterService _courseFilterService;
        private readonly IMapper _mapper;

        public CourseFiltersController(
            ICourseFilterService courseFilterService,
            IMapper mapper)
        {
            _courseFilterService = courseFilterService;
            _mapper = mapper;
        }

        [HttpPost("{courseId}/create")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Create(long courseId, [FromBody] CreateCourseFilterDTO courseFilterDto)
        {
            var courseFilterModel = _mapper.Map<CreateCourseFilterModel>(courseFilterDto);
            courseFilterModel.CourseId = courseId;

            var result = await _courseFilterService.CreateOrUpdateCourseFilter(courseFilterModel);
            return Ok(result);
        }
    }
}