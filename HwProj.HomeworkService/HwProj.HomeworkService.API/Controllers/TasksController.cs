using System.Threading.Tasks;
using AutoMapper;
using HwProj.HomeworkService.API.Models;
using HwProj.HomeworkService.API.Repositories;
using HwProj.HomeworkService.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.HomeworkService.API.Controllers
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

        [HttpGet]
        public async Task<HomeworkTaskViewModel[]> GetAllTasks()
        {
            var tasks = await _tasksService.GetAllTasksAsync();
            return _mapper.Map<HomeworkTaskViewModel[]>(tasks);
        }
        
        [HttpGet("{taskId}")]
        public async Task<IActionResult> GetTask(long taskId)
        {
            var task = await _tasksService.GetTaskAsync(taskId);
            return task == null
                ? NotFound()
                : Ok(_mapper.Map<HomeworkTaskViewModel>(task)) as IActionResult;
        }
        
        [HttpPost("{homeworkId}")]
        public async Task<long> AddTask(long homeworkId,
            [FromBody] CreateTaskViewModel taskViewModel)
        {
            var task = _mapper.Map<HomeworkTask>(taskViewModel);
            var taskId = await _tasksService.AddTaskAsync(homeworkId, task);
            return taskId;
        }
        
        [HttpDelete("{taskId}")]
        public async Task DeleteTask(long taskId)
        {
            await _tasksService.DeleteTaskAsync(taskId);
        }
        
        [HttpPost("update/{taskId}")]
        public async Task UpdateTask(long taskId,
            [FromBody] CreateTaskViewModel taskViewModel)
        {
            await _tasksService.UpdateTaskAsync(taskId, new HomeworkTask()
            {
                Title = taskViewModel.Title,
                Description = taskViewModel.Description
            });
        }
    }
}