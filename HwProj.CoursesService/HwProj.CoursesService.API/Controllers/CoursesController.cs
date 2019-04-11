using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Models.Repositories;
using HwProj.CoursesService.API.Models.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CoursesService.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoursesController : Controller
    {
        private readonly ICourseRepository _courseRepository;
        private readonly ICourseMateRepository _courseMateRepository;
        private readonly IMapper _mapper;

        public CoursesController(ICourseRepository courseRepository,
            ICourseMateRepository courseMateRepository, IMapper mapper)
        {
            _courseRepository = courseRepository;
            _courseMateRepository = courseMateRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public List<CourseViewModel> GetAll()
            => _courseRepository.GetAll().Select(FromCourseToViewModel).ToList();

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(long id)
        {
            var course = await _courseRepository.GetAsync(id);
            return course == null
                ? NotFound()
                : Ok(FromCourseToViewModel(course)) as IActionResult;
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
            
            return Ok(await _courseRepository.AddAsync(course));
        }

        [HttpDelete("{id}")]
        public async Task DeleteCourse(long id)
            => await _courseRepository.DeleteAsync(id);

        [HttpPost("update/{courseId}")]
        public async Task UpdateCourse(long courseId, [FromBody] UpdateCourseViewModel courseViewModel)
            => await _courseRepository.UpdateAsync(courseId, course => new Course()
            {
                Name = courseViewModel.Name,
                GroupName = courseViewModel.GroupName,
                IsComplete = courseViewModel.IsComplete,
                IsOpen = courseViewModel.IsOpen
            });

        [HttpPost("sign_in_course/{courseId}")]
        public async Task<IActionResult> SignInCourse(long courseId, [FromQuery] long studentId)
        {
            var course = await _courseRepository.GetAsync(courseId);
            
            if (studentId == 0 || course == null || course.IsComplete || studentId == course.MentorId)
            {
                return NotFound();
            }

            if (_courseMateRepository.FindAll(cs => cs.CourseId == courseId && cs.StudentId == studentId).Any())
            {
                return Ok();
            }
            
            var courseStudent = new CourseMate()
            {
                CourseId = courseId,
                StudentId = studentId,
                IsAccepted = course.IsOpen
            };
            await _courseMateRepository.AddAsync(courseStudent);
            return Ok();
        }

        [HttpPost("accept_student/{courseId}")]
        public async Task<IActionResult> AcceptStudent(long courseId, [FromQuery] long studentId)
        {
            var courseStudent = await _courseMateRepository
                .FindAsync(cs => cs.CourseId == courseId && cs.StudentId == studentId);

            if (courseStudent == null)
            {
                return NotFound();
            }
            
            await _courseMateRepository.UpdateAsync(courseStudent.Id, cs => new CourseMate() {IsAccepted = true});
            return Ok();
        }


        [HttpPost("reject_student/{courseId}")]
        public async Task<IActionResult> RejectStudent(long courseId, [FromQuery] long studentId)
        {
            var courseStudent = await _courseMateRepository
                .FindAsync(cs => cs.CourseId == courseId && cs.StudentId == studentId);

            if (courseStudent == null)
            {
                return NotFound();
            }
            
            await _courseMateRepository.DeleteAsync(courseStudent.Id);
            return Ok();
        }

        [HttpGet("student_courses/{studentId}")]
        public List<long> GetStudentCourses(long studentId)
            => _courseMateRepository
                .FindAll(cs => cs.StudentId == studentId && cs.IsAccepted)
                .Select(cs => cs.CourseId)
                .ToList();

        [HttpGet("mentor_courses/{mentodId}")]
        public List<long> GetMentorCourses(long mentodId)
            => _courseRepository
                .FindAll(c => c.MentorId == mentodId)
                .Select(c => c.Id)
                .ToList();

        private CourseViewModel FromCourseToViewModel(Course course)
        {
            var courseViewModel = _mapper.Map<CourseViewModel>(course);
            courseViewModel.CourseMates = _courseMateRepository.FindAll(cs => cs.CourseId == course.Id)
                .Select(_mapper.Map<CourseMateViewModel>)
                .ToList();

            return courseViewModel;
        }
    }
}
