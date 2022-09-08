using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.API.Filters;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Services;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Net;
using HwProj.Models.AuthService.DTO;

namespace HwProj.CoursesService.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoursesController : Controller
    {
        private readonly ICoursesService _coursesService;
        private readonly IMapper _mapper;

        public CoursesController(ICoursesService coursesService, IMapper mapper)
        {
            _coursesService = coursesService;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<CoursePreview[]> GetAll()
        {
            var coursesFromDb = await _coursesService.GetAllAsync();
            var courses = _mapper.Map<CoursePreview[]>(coursesFromDb).ToArray();
            return courses;
        }

        [HttpGet("{courseId}")]
        public async Task<IActionResult> Get(long courseId, [FromBody] string userId)
        {
            var courseFromDb = await _coursesService.GetAsync(courseId, userId);
            if (courseFromDb == null) return NotFound();

            var course = _mapper.Map<CourseDTO>(courseFromDb);

            //TODO: move to service
            foreach (var homework in course.Homeworks)
                homework.Tasks.ForEach(t => t.PutPossibilityForSendingSolution());

            return Ok(course);
        }

        [HttpPost("create")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> AddCourse([FromBody] CreateCourseViewModel courseViewModel,
            [FromQuery] string mentorId)
        {
            var course = _mapper.Map<Course>(courseViewModel);
            var id = await _coursesService.AddAsync(course, mentorId);
            return Ok(id);
        }

        [HttpDelete("{courseId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> DeleteCourse(long courseId)
        {
            await _coursesService.DeleteAsync(courseId);
            return Ok();
        }

        [HttpPost("update/{courseId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> UpdateCourse(long courseId, [FromBody] UpdateCourseViewModel courseViewModel)
        {
            await _coursesService.UpdateAsync(courseId, new Course
            {
                Name = courseViewModel.Name,
                GroupName = courseViewModel.GroupName,
                IsCompleted = courseViewModel.IsCompleted,
                IsOpen = courseViewModel.IsOpen
            });

            return Ok();
        }

        [HttpPost("signInCourse/{courseId}")]
        public async Task<IActionResult> SignInCourse(long courseId, [FromQuery] string studentId)
        {
            return await _coursesService.AddStudentAsync(courseId, studentId)
                ? Ok() as IActionResult
                : NotFound();
        }

        [HttpPost("acceptStudent/{courseId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> AcceptStudent(long courseId, [FromQuery] string studentId)
        {
            return await _coursesService.AcceptCourseMateAsync(courseId, studentId)
                ? Ok() as IActionResult
                : NotFound();
        }

        [HttpPost("rejectStudent/{courseId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> RejectStudent(long courseId, [FromQuery] string studentId)
        {
            return await _coursesService.RejectCourseMateAsync(courseId, studentId)
                ? Ok() as IActionResult
                : NotFound();
        }

        [HttpGet("userCourses")]
        public async Task<CoursePreview[]> GetCourses()
        {
            var userId = Request.GetUserIdFromHeader();
            var coursesFromDb = await _coursesService.GetUserCoursesAsync(userId);
            var courses = _mapper.Map<CoursePreview[]>(coursesFromDb).ToArray();
            return courses;
        }

        [HttpGet("acceptLecturer/{courseId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> AcceptLecturer(long courseId, [FromQuery] string lecturerEmail)
        {
            await _coursesService.AcceptLecturerAsync(courseId, lecturerEmail);
            return Ok();
        }

        [HttpGet("getLecturersAvailableForCourse/{courseId}")]
        [ProducesResponseType(typeof(AccountDataDto[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetLecturersAvailableForCourse(long courseId)
        {
            var mentorId = Request.GetMentorId();
            var result = await _coursesService.GetLecturersAvailableForCourse(courseId, mentorId);
            return result == null
                ? NotFound() as IActionResult
                : Ok(result);
        }
    }
}
