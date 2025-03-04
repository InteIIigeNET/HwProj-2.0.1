using System;
using System.Collections.Generic;
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
using HwProj.AuthService.Client;
using HwProj.CoursesService.API.Repositories;
using HwProj.Models.AuthService.DTO;
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
        private readonly IHomeworksService _homeworksService;
        private readonly ITasksService _tasksService;
        private readonly IHomeworksRepository _homeworksRepository;
        private readonly IMapper _mapper;

        public CoursesController(ICoursesService coursesService,
            IHomeworksService homeworksService,
            ITasksService tasksService,
            IHomeworksRepository homeworksRepository,
            IMapper mapper,
            ICourseFilterService courseFilterService)
        {
            _coursesService = coursesService;
            _homeworksService = homeworksService;
            _tasksService = tasksService;
            _homeworksRepository = homeworksRepository;
            _mapper = mapper;
            _courseFilterService = courseFilterService;
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
            var userId = Request.GetUserIdFromHeader();
            var course = await _coursesService.GetAsync(courseId, userId);
            if (course == null) return NotFound();

            return Ok(course);
        }

        [HttpGet("getForMentor/{courseId}/{mentorId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> GetForMentor(long courseId, string mentorId)
        {
            var course = await _coursesService.GetAsync(courseId, mentorId);
            if (course == null) return NotFound();

            return Ok(course);
        }

        [HttpGet("getAllData/{courseId}/")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> GetAllData(long courseId)
        {
            var course = await _coursesService.GetAsync(courseId);
            if (course == null) return NotFound();

            return Ok(course);
        }

        [CourseDataFilter]
        [HttpGet("getByTask/{taskId}")]
        public async Task<IActionResult> GetByTask(long taskId)
        {
            var userId = Request.GetUserIdFromHeader();
            var course = await _coursesService.GetByTaskAsync(taskId, userId);
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

        [HttpPost("recreate/{courseId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> RecreateCourse(long courseId, [FromQuery] string mentorId)
        {
            var course = await _coursesService.GetAsync(courseId);
            if (course == null) return NotFound();

            var courseTemplate = course.ToCourseTemplate();

            return await AddCourseFromTemplate(courseTemplate, mentorId);
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
        
        [HttpGet("getCourseLecturers/{courseId}")]
        [ProducesResponseType(typeof(string[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCourseLecturersIds(long courseId)
        {
            var result = await _coursesService.GetCourseLecturers(courseId);
            return Ok(result);
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
            var homeworks = await _homeworksRepository
                .FindAll(t => t.CourseId == courseId)
                .ToListAsync();

            var result = homeworks
                .SelectMany(hw => hw.Tags?.Split(';') ?? Array.Empty<string>())
                .Where(t => !string.IsNullOrEmpty(t))
                .ToArray();

            var defaultTags = new[] { HomeworkTags.Test, HomeworkTags.BonusTask, HomeworkTags.GroupWork };
            result = result.Concat(defaultTags).Distinct().ToArray();

            return Ok(result);
        }

        private async Task<IActionResult> AddCourseFromTemplate(CourseTemplate courseTemplate, string mentorId)
        {
            var courseId = await _coursesService.AddAsync(courseTemplate.ToCourse(), mentorId);
            foreach (var homeworkTemplate in courseTemplate.Homeworks)
            {
                var homeworkId = await _homeworksService.AddHomeworkAsync(courseId, homeworkTemplate.ToHomework());
                foreach (var taskTemplate in homeworkTemplate.Tasks)
                {
                    await _tasksService.AddTaskAsync(homeworkId, taskTemplate.ToHomeworkTask());
                }
            }

            return Ok(courseId);
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