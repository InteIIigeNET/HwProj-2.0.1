using System;
using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Domains;
using HwProj.CoursesService.API.Filters;
using HwProj.CoursesService.API.Services;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CoursesService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : Controller
    {
        private readonly ITasksService _tasksService;
        private readonly IHomeworksService _homeworksService;
        private readonly ICoursesService _coursesService;

        public TasksController(ITasksService tasksService, ICoursesService coursesService,
            IHomeworksService homeworksService)
        {
            _tasksService = tasksService;
            _coursesService = coursesService;
            _homeworksService = homeworksService;
        }

        [HttpGet("get/{taskId}")]
        public async Task<IActionResult> GetTask(long taskId)
        {
            var taskFromDb = await _tasksService.GetTaskAsync(taskId);
            if (taskFromDb == null) return NotFound();

            if (taskFromDb.PublicationDate > DateTime.UtcNow)
            {
                var userId = Request.GetUserIdFromHeader();
                var homework = taskFromDb.Homework;
                var lecturers = await _coursesService.GetCourseLecturers(homework.CourseId);
                if (!lecturers.Contains(userId)) return BadRequest();
            }

            var task = taskFromDb.ToHomeworkTaskViewModel();
            return Ok(task);
        }

        [HttpGet("getForEditing/{taskId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> GetForEditingTask(long taskId)
        {
            var taskFromDb = await _tasksService.GetForEditingTaskAsync(taskId);

            if (taskFromDb == null)
            {
                return NotFound();
            }

            var task = taskFromDb.ToHomeworkTaskForEditingViewModel();
            return Ok(task);
        }

        [HttpPost("add/{homeworkId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> AddTask(long homeworkId, [FromBody] CreateTaskViewModel taskViewModel)
        {
            var homework = await _homeworksService.GetHomeworkAsync(homeworkId);
            var validationResult = Validator.ValidateTask(taskViewModel, homework);
            if (validationResult.Any()) return BadRequest(validationResult);

            var taskId = await _tasksService.AddTaskAsync(homeworkId, taskViewModel.ToHomeworkTask());

            return Ok(taskId);
        }

        [HttpDelete("delete/{taskId}")] //bug with rights
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task DeleteTask(long taskId)
        {
            await _tasksService.DeleteTaskAsync(taskId);
        }

        [HttpPut("update/{taskId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> UpdateTask(long taskId, [FromBody] CreateTaskViewModel taskViewModel)
        {
            var previousState = await _tasksService.GetForEditingTaskAsync(taskId);
            var validationResult = Validator.ValidateTask(taskViewModel,
                await _homeworksService.GetForEditingHomeworkAsync(previousState.HomeworkId), previousState);

            if (validationResult.Any())
            {
                return BadRequest(validationResult);
            }

            await _tasksService.UpdateTaskAsync(taskId, taskViewModel.ToHomeworkTask());

            return Ok();
        }

        [HttpGet("{courseId}")]
        public async Task<HomeworkTaskViewModel[]> GetAllCourseTasks(long courseId)
        {
            var tasks = await _tasksService.GetAllCourseTasks(courseId);
            var result = tasks
                .Select(t => t.ToHomeworkTaskViewModel())
                .ToArray();

            return result;
        }
    }
}
