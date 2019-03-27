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
        public List<HomeworkViewModel> GetAllHomeworks()
            => _homeworkRepository.GetAll().Select(_mapper.Map<HomeworkViewModel>).ToList();

        [HttpGet("{homeworkId}")]
        public async Task<List<HomeworkViewModel>> GetHomework(long homeworkId)
        {
            var homework = await _homeworkRepository.GetAsync(homeworkId);
            return homework == null
                ? new List<HomeworkViewModel>()
                : new List<HomeworkViewModel> {_mapper.Map<HomeworkViewModel>(homework)};
        }

        [HttpGet("course_homeworks/{courseId}")]
        public List<HomeworkViewModel> GetCourseHomeworks(long courseId)
        {
            var courseHomeworks = _homeworkRepository.FindAll(hw => hw.CourseId == courseId);
            return courseHomeworks.Select(_mapper.Map<HomeworkViewModel>).ToList();
        }

        [HttpPost("{courseId}")]
        public async Task<List<HomeworkViewModel>> AddHomework(long courseId,
            [FromBody] CreateHomeworkViewModel homeworkViewModel)
        {
            var homework = _mapper.Map<Homework>(homeworkViewModel);
            homework.CourseId = courseId;
            homework.Date = DateTime.Now;
            await _homeworkRepository.AddAsync(homework);
            return new List<HomeworkViewModel> {_mapper.Map<HomeworkViewModel>(homework)};
        }

        [HttpPost("add_task/{homeworkId}")]
        public async Task<List<HomeworkTaskViewModel>> AddTask(long homeworkId,
            [FromBody] CreateTaskViewModel taskViewModel)
        {
            var task = _mapper.Map<HomeworkTask>(taskViewModel);
            task.HomeworkId = homeworkId;
            await _taskRepository.AddAsync(task);
            return new List<HomeworkTaskViewModel> {_mapper.Map<HomeworkTaskViewModel>(task)};
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
