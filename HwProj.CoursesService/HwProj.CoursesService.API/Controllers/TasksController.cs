using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Services;
using HwProj.Models.CoursesService.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CoursesService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : Controller
    {
        private readonly ITasksService _tasksService;
        private readonly IMapper _mapper;

        public TasksController(ITasksService tasksService, IMapper mapper)
        {
            _tasksService = tasksService;
            _mapper = mapper;
        }

        [HttpGet("get/{taskId}")]
        public async Task<IActionResult> GetTask(long taskId)
        {
            var taskFromDb = await _tasksService.GetTaskAsync(taskId);

            if (taskFromDb == null)
            {
                return NotFound();
            }

            var task = _mapper.Map<HomeworkTaskViewModel>(taskFromDb);
            task.PutPossibilityForSendingSolution();
            
            return Ok(task);
        }
        
        [HttpPost("{homeworkId}/add")]
        public async Task<long> AddTask(long homeworkId, [FromBody] CreateTaskViewModel taskViewModel)
        {
            taskViewModel.InitializeDeadline();
            var task = _mapper.Map<HomeworkTask>(taskViewModel);
            var taskId = await _tasksService.AddTaskAsync(homeworkId, task);
            return taskId;
        }
        
        [HttpDelete("delete/{taskId}")] //bug with rights
        public async Task DeleteTask(long taskId)
        {
            await _tasksService.DeleteTaskAsync(taskId);
        }
        
        [HttpPut("update/{taskId}")]
        public async Task UpdateTask(long taskId, [FromBody] CreateTaskViewModel taskViewModel)
        {
            taskViewModel.InitializeDeadline();
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
        }
    }
}
