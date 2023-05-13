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
            ICourseMatesRepository courseMatesRepository, IMapper mapper)
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
            var courses = _mapper.Map<CoursePreview[]>(coursesFromDb).ToArray();
            return courses;
        }

        [CourseDataFilter]
        [HttpGet("{courseId}")]
        public async Task<IActionResult> Get(long courseId)
        {
            var courseFromDb = await _coursesService.GetAsync(courseId);
            if (courseFromDb == null) return NotFound();

            var course = _mapper.Map<CourseDTO>(courseFromDb);
            return Ok(course);
        }

        [CourseDataFilter]
        [HttpGet("getByTask/{taskId}")]
        public async Task<IActionResult> GetByTask(long taskId)
        {
            var courseFromDb = await _coursesService.GetByTaskAsync(taskId);
            if (courseFromDb == null) return NotFound();

            var course = _mapper.Map<CourseDTO>(courseFromDb);
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
        public async Task<CourseDTO[]> GetUserCourses()
        {
            var userId = Request.GetUserIdFromHeader();
            var coursesFromDb = await _coursesService.GetUserCoursesAsync(userId);
            var courses = _mapper.Map<CourseDTO[]>(coursesFromDb).ToArray();
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

        //TODO: optimize
        [HttpGet("taskDeadlines")]
        public async Task<TaskDeadlineDto[]> GetUserDeadlines()
        {
            var userId = Request.GetUserIdFromHeader();
            var courseIds = await _courseMatesRepository.FindAll(t => t.StudentId == userId).Select(t => t.CourseId)
                .ToListAsync();

            var currentDate = DateTimeUtils.GetMoscowNow();
            var courses = await _coursesRepository
                .FindAll(t => courseIds.Contains(t.Id))
                .Include(t => t.Homeworks)
                .ThenInclude(t => t.Tasks)
                .ToListAsync();

            var result = courses
                .SelectMany(course => course.Homeworks
                    .SelectMany(x => x.Tasks)
                    .Where(t => t.HasDeadline && t.PublicationDate <= currentDate && t.DeadlineDate > currentDate)
                    .Select(task => new TaskDeadlineDto
                    {
                        TaskId = task.Id,
                        TaskTitle = task.Title,
                        CourseTitle = course.Name + " / " + course.GroupName,
                        PublicationDate = task.PublicationDate,
                        MaxRating = task.MaxRating,
                        DeadlineDate = task.DeadlineDate!.Value
                    }))
                .OrderBy(t => t.DeadlineDate)
                .ToArray();

            return result;
        }
    }
}
