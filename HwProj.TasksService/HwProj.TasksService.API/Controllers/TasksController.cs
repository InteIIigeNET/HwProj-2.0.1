using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.TasksService.API.Models;
using HwProj.TasksService.API.Models.Repositories;
using HwProj.TasksService.API.Models.ViewModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.TasksService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : Controller
    {
        private readonly ITaskRepository _taskRepository;
        private readonly IHomeworkRepository _homeworkRepository;
        private readonly IMapper _mapper;

        public TasksController(ITaskRepository taskRepository, IHomeworkRepository homeworkRepository, IMapper mapper)
        {
            _taskRepository = taskRepository;
            _homeworkRepository = homeworkRepository;
            _mapper = mapper;
        }

        [HttpGet("{taskId}")]
        public async Task<IActionResult> GetTask(long taskId)
        {
            var task = await _taskRepository.GetAsync(t => t.Id == taskId);
            return task == null
                ? NotFound() as IActionResult
                : Ok(_mapper.Map<TaskViewModel>(task));
        }

        [HttpPost("add_task/{homeworkId}")]
        public async Task<IActionResult> AddTask(long homeworkId, [FromBody]CreateTaskViewModel taskViewModel)
        {
            var task = _mapper.Map<HomeworkTask>(taskViewModel);
            await _homeworkRepository.AddTask(homeworkId, task);

            return Ok(_mapper.Map<TaskViewModel>(task));
        }

        [HttpGet("homework_tasks/{homeworkId}")]
        public async Task<IActionResult> GetHomeworkTasks(long homeworkId)
        {
            var homework = await _homeworkRepository.GetAsync(h => h.Id == homeworkId);
            return homework == null
                ? NotFound() as IActionResult
                : Json(homework.Tasks.Select(t => _mapper.Map<TaskViewModel>(t)));
        }

        [HttpPost("update_task/{taskId}")]
        public async Task<IActionResult> UpdateTask(long taskId, [FromBody]CreateTaskViewModel taskViewModel)
        {
            var updated = await _taskRepository.UpdateAsync(t => t.Id == taskId, t => new HomeworkTask()
            {
                Title = taskViewModel.Title,
                Description = taskViewModel.Description
            });

            return updated
                ? Ok()
                : NotFound() as IActionResult;
        }

        [HttpDelete("delete_task/{taskId}")]
        public async Task<IActionResult> DeleteTask(long taskId)
        {
            var deleted = await _taskRepository.DeleteAsync(t => t.Id == taskId);
            return deleted
                ? Ok()
                : NotFound() as IActionResult;
        }
    }
}