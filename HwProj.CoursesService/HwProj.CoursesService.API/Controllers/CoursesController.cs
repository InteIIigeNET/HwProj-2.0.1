using System;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.API.Filters;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Services;
using HwProj.Models.CoursesService.ViewModels;
using Microsoft.AspNetCore.Mvc;

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
        public async Task<CourseViewModel[]> GetAll()
        {
            var courses = await _coursesService.GetAllAsync().ConfigureAwait(false);
            return _mapper.Map<CourseViewModel[]>(courses);
        }

        [HttpGet("{courseId}")]
        public async Task<IActionResult> Get(long courseId)
        {
            var course = await _coursesService.GetAsync(courseId);
            return course == null
                ? NotFound()
                : Ok(_mapper.Map<CourseViewModel>(course)) as IActionResult;
        }

        [HttpPost("create")]
        public async Task<IActionResult> AddCourse([FromBody] CreateCourseViewModel courseViewModel, [FromQuery] string mentorId)
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
                IsCompleted = courseViewModel.IsComplete,
                IsOpen = courseViewModel.IsOpen
            });

            return Ok();
        }

        [HttpPost("signInCourse/{courseId}")]
        public async Task<IActionResult> SignInCourse(long courseId, [FromQuery] string studentId)
        {
            return await _coursesService.AddStudentAsync(courseId, studentId)
                ? Ok()
                : NotFound() as IActionResult;
        }

        [HttpPost("acceptStudent/{courseId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> AcceptStudent(long courseId, [FromQuery] string studentId)
        {
            return await _coursesService.AcceptCourseMateAsync(courseId, studentId)
                ? Ok()
                : NotFound() as IActionResult;
        }

        [HttpPost("rejectStudent/{courseId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> RejectStudent(long courseId, [FromQuery] string studentId)
        {
            return await _coursesService.RejectCourseMateAsync(courseId, studentId)
                ? Ok()
                : NotFound() as IActionResult;
        }

        [HttpGet("userCourses/{userId}")]
        public async Task<IActionResult> GetCourses(string userId)
        {
            var courses = await _coursesService.GetUserCoursesAsync(userId);
            return Ok(courses);
        }
    }
}
