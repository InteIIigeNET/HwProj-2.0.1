using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using FluentValidation;
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
        private readonly IValidator<CreateTaskViewModel> _validator;
        private readonly IMapper _mapper;
        private readonly ICoursesService _coursesService;

        public TasksController(ITasksService tasksService, IMapper mapper, IValidator<CreateTaskViewModel> validator, ICoursesService coursesService, IHomeworksRepository homeworksRepository)
        {
            _tasksService = tasksService;
            _mapper = mapper;
            _validator = validator;
            _coursesService = coursesService;
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

        [HttpPost("add")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> AddTask([FromBody] CreateTaskViewModel taskViewModel)
        {
            var validationResult = await _validator.ValidateAsync(taskViewModel);

            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.Errors);
            }

            var task = _mapper.Map<HomeworkTask>(taskViewModel);
            var taskId = await _tasksService.AddTaskAsync(taskViewModel.HomeworkId, task);

            return Ok(taskId);
        }

        [HttpDelete("delete/{taskId}")] //bug with rights
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task DeleteTask(long taskId)
        {
            await _tasksService.DeleteTaskAsync(taskId);
        }
        
        [HttpPut("update")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> UpdateTask([FromBody] CreateTaskViewModel taskViewModel)
        {
            var validationResult = await _validator.ValidateAsync(taskViewModel);

            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.Errors);
            }

            await _tasksService.UpdateTaskAsync(taskViewModel.Id, new HomeworkTask()
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
