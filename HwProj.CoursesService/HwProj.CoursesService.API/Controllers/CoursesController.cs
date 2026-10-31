using System;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Authorization;
using Microsoft.AspNetCore.Authorization;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Services;
using HwProj.Models.CoursesService.ViewModels;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Net;
using HwProj.Common.Net8;
using HwProj.CoursesService.API.Repositories;
using HwProj.Models.CoursesService.DTO;
using Microsoft.EntityFrameworkCore;
using HwProj.CoursesService.API.Domains;
using HwProj.Models.CoursesService;
using HwProj.Models.Roles;

namespace HwProj.CoursesService.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoursesController : Controller
    {
        private readonly ICoursesService _coursesService;
        private readonly ICourseFilterService _courseFilterService;
        private readonly IHomeworksRepository _homeworksRepository;

        public CoursesController(ICoursesService coursesService,
            IHomeworksRepository homeworksRepository,
            ICourseFilterService courseFilterService)
        {
            _coursesService = coursesService;
            _homeworksRepository = homeworksRepository;
            _courseFilterService = courseFilterService;
        }

        [HttpGet]
        public async Task<CoursePreview[]> GetAll()
        {
            var coursesFromDb = await _coursesService.GetAllAsync();
            var courses = coursesFromDb.Select(c => c.ToCoursePreview()).ToArray();
            return courses;
        }

        [Authorize]
        [HttpGet("view/{courseId}")]
        public async Task<IActionResult> GetView(long courseId)
        {
            var userId = User.GetUserId();
            var course = await _coursesService.GetForUserAsync(courseId, userId, true);
            if (course == null) return NotFound();

            return Ok(course);
        }
        
        [Authorize]
        [HttpGet("{courseId}")]
        public async Task<IActionResult> Get(long courseId)
        {
            var userId = User.GetUserId();
            var course = await _coursesService.GetForUserAsync(courseId, userId);
            if (course == null) return NotFound();

            return Ok(course);
        }

        [HttpGet("getForMentor/{courseId}/{mentorId}")]
        [Authorize(Policy = Policies.CourseMentor)]
        public async Task<IActionResult> GetForMentor(long courseId, string mentorId)
        {
            var course = await _coursesService.GetAsync(courseId, mentorId);
            if (course == null) return NotFound();

            return Ok(course);
        }

        [HttpGet("getAllData/{courseId}/")]
        [Authorize(Policy = Policies.CourseMentor)]
        public async Task<IActionResult> GetAllData(long courseId)
        {
            var course = await _coursesService.GetAsync(courseId);
            if (course == null) return NotFound();

            return Ok(course);
        }

        [Authorize]
        [HttpGet("getByTask/{taskId}")]
        public async Task<IActionResult> GetByTask(long taskId)
        {
            var userId = User.GetUserId();
            var course = await _coursesService.GetByTaskAsync(taskId, userId);
            if (course == null) return NotFound();

            return Ok(course);
        }

        [Authorize]
        [HttpPost("create")]
        public async Task<IActionResult> AddCourse([FromBody] CreateCourseViewModel courseViewModel)
        {
            var mentorId = User.GetUserId();
            var courseId = await _coursesService.AddAsync(courseViewModel, mentorId);

            return Ok(courseId);
        }

        [HttpDelete("{courseId}")]
        [Authorize(Policy = Policies.CourseMentor)]
        public async Task<IActionResult> DeleteCourse(long courseId)
        {
            await _coursesService.DeleteAsync(courseId);
            return Ok();
        }

        [HttpPost("update/{courseId}")]
        [Authorize(Policy = Policies.CourseMentor)]
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
        [Authorize(Policy = Policies.CourseMentor)]
        public async Task<IActionResult> AcceptStudent(long courseId, [FromQuery] string studentId)
        {
            return await _coursesService.AcceptCourseMateAsync(courseId, studentId)
                ? Ok() as IActionResult
                : NotFound();
        }

        [HttpPost("updateCharacteristics")]
        [Authorize(Policy = Policies.CourseMentor)]
        public async Task<IActionResult> UpdateStudentCharacteristics([FromQuery] long courseId,
            [FromQuery] string studentId,
            [FromBody] StudentCharacteristicsDto characteristics)
        {
            return await _coursesService.UpdateStudentCharacteristics(courseId, studentId, characteristics)
                ? Ok() as IActionResult
                : NotFound();
        }

        [HttpPost("rejectStudent/{courseId}")]
        [Authorize(Policy = Policies.CourseMentor)]
        public async Task<IActionResult> RejectStudent(long courseId, [FromQuery] string studentId)
        {
            return await _coursesService.RejectCourseMateAsync(courseId, studentId)
                ? Ok() as IActionResult
                : NotFound();
        }

        [Authorize]
        [HttpGet("userCourses")]
        public async Task<CourseDTO[]> GetUserCourses(string role)
        {
            var userId = User.GetUserId();
            var courses = await _coursesService.GetUserCoursesAsync(userId, role);

            return courses;
        }

        [HttpGet("acceptLecturer/{courseId}")]
        [Authorize(Policy = Policies.CourseMentor)]
        public async Task<IActionResult> AcceptLecturer(long courseId, [FromQuery] string lecturerEmail,
            [FromQuery] string lecturerId)
        {
            await _coursesService.AcceptLecturerAsync(courseId, lecturerEmail, lecturerId);
            return Ok();
        }

        [HttpGet("getCourseLecturers/{courseId}")]
        [ProducesResponseType(typeof(string[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCourseLecturersIds(long courseId)
        {
            var result = await _coursesService.GetCourseLecturers(courseId);
            return Ok(result);
        }

        //TODO: optimize
        [Authorize]
        [HttpGet("taskDeadlines")]
        public async Task<TaskDeadlineDto[]> GetUserDeadlines()
        {
            var userId = User.GetUserId();

            var courses = await _coursesService.GetUserCoursesAsync(userId, Roles.StudentRole);

            var currentDate = DateTime.UtcNow;

            //TODO: Move to service

            var result = courses
                .SelectMany(course => course.Homeworks
                    .SelectMany(x => x.Tasks)
                    .Where(t =>
                        (t.HasDeadline ?? false)
                        && t.PublicationDate <= currentDate
                        && (t.DeadlineDate >= currentDate || !(t.IsDeadlineStrict ?? true))
                        && !(t.Tags.Contains(HomeworkTags.Test) && t.DeadlineDate <= currentDate))
                    .Select(task => new TaskDeadlineDto
                    {
                        TaskId = task.Id,
                        CourseId = course.Id,
                        HomeworkId = task.HomeworkId,
                        TaskTitle = task.Title,
                        Tags = task.Tags,
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
            var homeworksTags = await _homeworksRepository
                .FindAll(t => t.CourseId == courseId)
                .Select(t => t.Tags)
                .ToListAsync();

            var result = homeworksTags
                .SelectMany(tags => tags?.Split(';') ?? Array.Empty<string>())
                .Where(t => !string.IsNullOrEmpty(t))
                .ToArray();

            var defaultTags = new[] { HomeworkTags.Test, HomeworkTags.BonusTask, HomeworkTags.GroupWork };
            result = result.Concat(defaultTags).Distinct().ToArray();

            return Ok(result);
        }

        [HttpGet("getMentorsToStudents/{courseId}")]
        [ProducesResponseType(typeof(MentorToAssignedStudentsDTO), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetMentorsToAssignedStudents(long courseId)
        {
            var mentorIds = await _coursesService.GetCourseLecturers(courseId);
            var mentorsToAssignedStudents = await _courseFilterService.GetAssignedStudentsIds(courseId, mentorIds);
            return Ok(mentorsToAssignedStudents);
        }
    }
}
