using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.HomeworkService.API.Models;
using HwProj.HomeworkService.API.Models.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.HomeworkService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HomeworksController : Controller
    {
        private readonly IHomeworkRepository _homeworkRepository;
        private readonly ITaskRepository _taskRepository;
        private readonly IMapper _mapper;

        public HomeworksController(ITaskRepository taskRepository, IHomeworkRepository homeworkRepository,
            IMapper mapper)
        {
            _homeworkRepository = homeworkRepository;
            _taskRepository = taskRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<List<HomeworkViewModel>> GetAllHomeworks()
            => _mapper.Map<List<HomeworkViewModel>>(await _homeworkRepository.GetAllWithTasksAsync());

        [HttpGet("{homeworkId}")]
        public async Task<IActionResult> GetHomework(long homeworkId)
        {
            var homework = await _homeworkRepository.GetWithTasksAsync(homeworkId);
            if (homework == null)
            {
                return NotFound();
            }

            return Ok(_mapper.Map<HomeworkViewModel>(homework));
        }

        [HttpGet("get_task/{taskId}")]
        public async Task<IActionResult> GetTask(long taskId)
        {
            var task = await _taskRepository.GetAsync(taskId);
            return task == null
                ? NotFound()
                : Ok(_mapper.Map<HomeworkTaskViewModel>(task)) as IActionResult;
        }

        [HttpGet("course_homeworks/{courseId}")]
        public List<long> GetCourseHomeworks(long courseId)
            => _homeworkRepository.FindAll(hw => hw.CourseId == courseId).Select(h => h.Id).ToList();

        [HttpPost("{courseId}")]
        public async Task<long> AddHomework(long courseId,
            [FromBody] CreateHomeworkViewModel homeworkViewModel)
        {
            var homework = _mapper.Map<Homework>(homeworkViewModel);
            homework.CourseId = courseId;
            homework.Date = DateTime.Now;
            return await _homeworkRepository.AddAsync(homework);
        }

        [HttpPost("add_task/{homeworkId}")]
        public async Task<long> AddTask(long homeworkId,
            [FromBody] CreateTaskViewModel taskViewModel)
        {
            var task = _mapper.Map<HomeworkTask>(taskViewModel);
            task.HomeworkId = homeworkId;
            return await _taskRepository.AddAsync(task);
        }

        [HttpDelete("{homeworkId}")]
        public async Task DeleteHomework(long homeworkId)
            => await _homeworkRepository.DeleteAsync(homeworkId);

        [HttpDelete("delete_task/{taskId}")]
        public async Task DeleteTask(long taskId)
            => await _taskRepository.DeleteAsync(taskId);

        [HttpPost("update_homework/{homeworkId}")]
        public async Task UpdateHomework(long homeworkId,
            [FromBody] CreateHomeworkViewModel homeworkViewModel)
        {
            await _homeworkRepository.UpdateAsync(homeworkId, homework => new Homework()
            {
                Title = homeworkViewModel.Title,
                Description = homeworkViewModel.Description
            });
        }
        
        [HttpPost("update_task/{taskId}")]
        public async Task UpdateTask(long taskId,
            [FromBody] CreateTaskViewModel taskViewModel)
        {
            await _homeworkRepository.UpdateAsync(taskId, homework => new Homework()
            {
                Title = taskViewModel.Title,
                Description = taskViewModel.Description
            });
        }
    }
}
