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
        private readonly IUserRepository _studentRepository;
        private readonly ICourseStudentRepository _courseStudentRepository;
        private readonly IMapper _mapper;

        public CoursesController(ICourseRepository courseRepository, IUserRepository studentRepository,
            ICourseStudentRepository courseStudentRepository, IMapper mapper)
        {
            _courseRepository = courseRepository;
            _studentRepository = studentRepository;
            _courseStudentRepository = courseStudentRepository;
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
            var courseTask = _courseRepository.GetAsync(courseId);
            var studentTask = _studentRepository.GetAsync(studentId);
            await Task.WhenAll(courseTask, studentTask);
            
            var course = courseTask.Result;
            var student = studentTask.Result;
            
            if (studentId == 0 || course == null || course.IsComplete)
            {
                return NotFound();
            }

            if (student == null)
            {
                student = new Student() {Id = studentId};
                await _studentRepository.AddAsync(student);
            }

            if (_courseStudentRepository.FindAll(cs => cs.CourseId == courseId && cs.StudentId == studentId).Any())
            {
                return Ok();
            }
            
            var courseStudent = new CourseStudent()
            {
                CourseId = courseId,
                StudentId = studentId,
                IsAccepted = course.IsOpen
            };
            await _courseStudentRepository.AddAsync(courseStudent);
            return Ok();
        }

        [HttpPost("accept_student/{courseId}")]
        public async Task<IActionResult> AcceptStudent(long courseId, [FromQuery] long studentId)
        {
            var courseStudent = await _courseStudentRepository
                .FindAsync(cs => cs.CourseId == courseId && cs.StudentId == studentId);

            if (courseStudent == null)
            {
                return NotFound();
            }
            
            await _courseStudentRepository.UpdateAsync(courseStudent.Id, cs => new CourseStudent() {IsAccepted = true});
            return Ok();
        }


        [HttpPost("reject_student/{courseId}")]
        public async Task<IActionResult> RejectStudent(long courseId, [FromQuery] long studentId)
        {
            var courseStudent = await _courseStudentRepository
                .FindAsync(cs => cs.CourseId == courseId && cs.StudentId == studentId);

            if (courseStudent == null)
            {
                return NotFound();
            }
            
            await _courseStudentRepository.DeleteAsync(courseStudent.Id);
            return Ok();
        }

        [HttpGet("student_courses/{studentId}")]
        public List<long> GetStudentCourses(long studentId)
            => _courseStudentRepository
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
            courseViewModel.CourseStudents = _courseStudentRepository.FindAll(cs => cs.CourseId == course.Id)
                .Select(cs => new CourseStudentViewModel(cs))
                .ToList();

            return courseViewModel;
        }
    }
}
