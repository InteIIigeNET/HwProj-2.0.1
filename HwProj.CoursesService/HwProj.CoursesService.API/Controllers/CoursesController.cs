using System;
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
using HwProj.CoursesService.API.Repositories;
using HwProj.Models;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.CoursesService.DTO;
using Microsoft.EntityFrameworkCore;
using HwProj.CoursesService.API.Domains;
using HwProj.Models.Roles;
using Microsoft.EntityFrameworkCore.Internal;

namespace HwProj.CoursesService.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoursesController : Controller
    {
        private readonly ICoursesService _coursesService;
        private readonly ICoursesRepository _coursesRepository;
        private readonly ICourseMatesRepository _courseMatesRepository;
        private readonly IMapper _mapper;

        public CoursesController(ICoursesService coursesService,
            ICoursesRepository coursesRepository,
            ICourseMatesRepository courseMatesRepository,
            IMapper mapper)
        {
            _coursesService = coursesService;
            _coursesRepository = coursesRepository;
            _courseMatesRepository = courseMatesRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<CoursePreview[]> GetAll()
        {
            var coursesFromDb = await _coursesService.GetAllAsync();
            var courses = coursesFromDb.Select(c => c.ToCoursePreview()).ToArray();
            return courses;
        }

        [CourseDataFilter]
        [HttpGet("{courseId}")]
        public async Task<IActionResult> Get(long courseId)
        {
            var course = await _coursesService.GetAsync(courseId);
            if (course == null) return NotFound();

            return Ok(course);
        }

        [CourseDataFilter]
        [HttpGet("getByTask/{taskId}")]
        public async Task<IActionResult> GetByTask(long taskId)
        {
            var course = await _coursesService.GetByTaskAsync(taskId);
            if (course == null) return NotFound();

            return Ok(course);
        }

        [HttpPost("create")]
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

        [CourseDataFilter]
        [HttpGet("userCourses")]
        public async Task<CourseDTO[]> GetUserCourses(string role)
        {
            var userId = Request.GetUserIdFromHeader();
            var courses = await _coursesService.GetUserCoursesAsync(userId, role);

            return courses;
        }

        [HttpGet("acceptLecturer/{courseId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> AcceptLecturer(long courseId, [FromQuery] string lecturerEmail,
            [FromQuery] string lecturerId)
        {
            await _coursesService.AcceptLecturerAsync(courseId, lecturerEmail, lecturerId);
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

        //TODO: optimize
        [HttpGet("taskDeadlines")]
        public async Task<TaskDeadlineDto[]> GetUserDeadlines()
        {
            var userId = Request.GetUserIdFromHeader();

            var courses = await _coursesService.GetUserCoursesAsync(userId, Roles.StudentRole);

            var currentDate = DateTime.UtcNow;
            
            //TODO: Move to service

            var result = courses
                .SelectMany(course => course.Homeworks
                    .SelectMany(x => x.Tasks)
                    .Where(t =>
                        (t.HasDeadline ?? false)
                        && t.PublicationDate <= currentDate
                        && (t.DeadlineDate >= currentDate || !(t.IsDeadlineStrict ?? true)))
                    .Select(task => new TaskDeadlineDto
                    {
                        TaskId = task.Id,
                        TaskTitle = task.Title,
                        CourseTitle = course.Name + " / " + course.GroupName,
                        PublicationDate = task.PublicationDate ?? DateTime.MinValue,
                        MaxRating = task.MaxRating,
                        DeadlineDate = task.DeadlineDate!.Value
                    }))
                .OrderBy(t => t.DeadlineDate)
                .ToArray();

            return result;
        }

        [HttpGet("getAllTagsForCourse/{courseId}")]
        [ProducesResponseType(typeof(string[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAllTagsForCourse(long courseId)
        {
            var course = await _coursesRepository.GetWithCourseMatesAsync(courseId);
            if (course == null)
                return NotFound();

            var result = course.Homeworks
                .SelectMany(hw => hw.Tags.Split(';'))
                .Where(t => !string.IsNullOrEmpty(t))
                .ToArray();
            return Ok(result);
        }
    }
}
