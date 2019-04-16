using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Models.Repositories;
using HwProj.CoursesService.API.Models.ViewModels;
using HwProj.CoursesService.API.Services;
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
        public async Task<List<CourseViewModel>> GetAll()
            => _mapper.Map<List<CourseViewModel>>(await _coursesService.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(long id)
        {
            var course = await _coursesService.GetAsync(id);
            return course == null
                ? NotFound()
                : Ok(_mapper.Map<CourseViewModel>(course)) as IActionResult;
        }

        [HttpPost]
        public async Task<IActionResult> AddCourse([FromBody]CreateCourseViewModel courseViewModel,
            [FromQuery] long mentorId)
        {
            if (mentorId == 0)
            {
                return NotFound();
            }
            
            var course = _mapper.Map<Course>(courseViewModel);
            course.MentorId = mentorId;
            
            return Ok(await _coursesService.AddAsync(course));
        }

        [HttpDelete("{id}")]
        public async Task DeleteCourse(long id)
            => await _coursesService.DeleteAsync(id);

        [HttpPost("update/{courseId}")]
        public async Task UpdateCourse(long courseId, [FromBody] UpdateCourseViewModel courseViewModel)
            => await _coursesService.UpdateAsync(courseId, course => new Course()
            {
                Name = courseViewModel.Name,
                GroupName = courseViewModel.GroupName,
                IsComplete = courseViewModel.IsComplete,
                IsOpen = courseViewModel.IsOpen
            });

        [HttpPost("sign_in_course/{courseId}")]
        public async Task<IActionResult> SignInCourse(long courseId, [FromQuery] long studentId)
        {
            if (studentId == 0)
            {
                return NotFound();
            }

            return await _coursesService.AddStudent(courseId, studentId)
                ? Ok()
                : NotFound() as IActionResult;
        }

        [HttpPost("accept_student/{courseId}")]
        public async Task<IActionResult> AcceptStudent(long courseId, [FromQuery] long studentId)
        {
            if (studentId == 0)
            {
                return NotFound();
            }

            return await _coursesService.AcceptCourseMate(courseId, studentId)
                ? Ok()
                : NotFound() as IActionResult;
        }


        [HttpPost("reject_student/{courseId}")]
        public async Task<IActionResult> RejectStudent(long courseId, [FromQuery] long studentId)
        {
            if (studentId == 0)
            {
                return NotFound();
            }

            return await _coursesService.RejectCourseMate(courseId, studentId)
                ? Ok()
                : NotFound() as IActionResult;
        }

        [HttpGet("student_courses/{studentId}")]
        public List<long> GetStudentCourses(long studentId)
            => _coursesService.GetStudentCourses(studentId);

        [HttpGet("mentor_courses/{mentorId}")]
        public List<long> GetMentorCourses(long mentorId)
            => _coursesService.GetMentorCourses(mentorId);
    }
}
