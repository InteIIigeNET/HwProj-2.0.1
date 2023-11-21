using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.API.Domains;
using HwProj.CoursesService.API.Filters;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.CoursesService.API.Services;
using HwProj.Models;
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
        private readonly IMapper _mapper;
        private readonly IHomeworksService _homeworksService;
        private readonly ICoursesService _coursesService;

        public TasksController(ITasksService tasksService, IMapper mapper, ICoursesService coursesService, IHomeworksService homeworksService)
        {
            _tasksService = tasksService;
            _mapper = mapper;
            _coursesService = coursesService;
            _homeworksService = homeworksService;
        }

        [HttpGet("get/{taskId}")]
        public async Task<IActionResult> GetTask(long taskId)
        {
            var taskFromDb = await _tasksService.GetTaskAsync(taskId);
            if (taskFromDb == null) return NotFound();

            if (taskFromDb.PublicationDate > DateTimeUtils.GetMoscowNow())
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
            var validationResult = taskViewModel.Validate(await _homeworksService.GetHomeworkAsync(homeworkId));

            if (validationResult.Count != 0)
            {
                return BadRequest(validationResult);
            }

            var task = _mapper.Map<HomeworkTask>(taskViewModel);
            var taskId = await _tasksService.AddTaskAsync(homeworkId, task);

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
            var validationResult = taskViewModel.Validate(await _homeworksService.GetHomeworkAsync(previousState.HomeworkId), previousState);

            if (validationResult.Count != 0)
            {
                return BadRequest(validationResult);
            }

            await _tasksService.UpdateTaskAsync(taskId, new HomeworkTask()
            {
                Title = taskViewModel.Title,
                Description = taskViewModel.Description,
                MaxRating = taskViewModel.MaxRating,
                DeadlineDate = taskViewModel.DeadlineDate,
                HasDeadline = taskViewModel.HasDeadline,
                IsDeadlineStrict = taskViewModel.IsDeadlineStrict,
                PublicationDate = taskViewModel.PublicationDate
            });

            return Ok();
        }
    }
}
