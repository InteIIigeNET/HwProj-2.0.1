using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.HomeworkService.API.Models;
using HwProj.HomeworkService.API.Models.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.HomeworkService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : Controller
    {
        private readonly ITaskRepository _taskRepository;
        private readonly IMapper _mapper;

        public TasksController(ITaskRepository taskRepository, IMapper mapper)
        {
            _taskRepository = taskRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public List<HomeworkTaskViewModel> GetAllTasks()
            => _mapper.Map<List<HomeworkTaskViewModel>>(_taskRepository.GetAll());
        
        [HttpGet("{taskId}")]
        public async Task<IActionResult> GetTask(long taskId)
        {
            var task = await _taskRepository.GetAsync(taskId);
            return task == null
                ? NotFound()
                : Ok(_mapper.Map<HomeworkTaskViewModel>(task)) as IActionResult;
        }
        
        [HttpPost("{homeworkId}")]
        public async Task<long> AddTask(long homeworkId,
            [FromBody] CreateTaskViewModel taskViewModel)
        {
            var task = _mapper.Map<HomeworkTask>(taskViewModel);
            task.HomeworkId = homeworkId;
            return await _taskRepository.AddAsync(task);
        }
        
        [HttpDelete("{taskId}")]
        public async Task DeleteTask(long taskId)
            => await _taskRepository.DeleteAsync(taskId);
        
        [HttpPost("update/{taskId}")]
        public async Task UpdateTask(long taskId,
            [FromBody] CreateTaskViewModel taskViewModel)
        {
            await _taskRepository.UpdateAsync(taskId, homework => new HomeworkTask()
            {
                Title = taskViewModel.Title,
                Description = taskViewModel.Description
            });
        }
    }
}