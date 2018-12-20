using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.HomeworkService.API.Models;
using HwProj.HomeworkService.API.Models.Repositories;
using HwProj.HomeworkService.API.Models.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.HomeworkService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HomeworkController : Controller
    {
        private readonly IHomeworkRepository _homeworkRepository;
        private readonly ICourseRepository _courseRepository;
        private readonly IApplicationRepository _applicationRepository;
        private readonly ITaskRepository _taskRepository;
        private readonly IMapper _mapper;

        public HomeworkController(IHomeworkRepository homeworkRepository, ICourseRepository courseRepository,
            IApplicationRepository applicationRepository, ITaskRepository taskRepository, IMapper mapper)
        {
            _homeworkRepository = homeworkRepository;
            _courseRepository = courseRepository;
            _applicationRepository = applicationRepository;
            _taskRepository = taskRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public IActionResult GetAll()
            => Json(_homeworkRepository.GetAll().Select(h => HomeworkViewModel.FromHomework(h, _mapper)));

        [HttpGet("{homeworkId}")]
        public async Task<IActionResult> Get(long homeworkId)
        {
            var homework = await _homeworkRepository.GetAsync(c => c.Id == homeworkId);
            return homework == null
                ? NotFound() as IActionResult
                : Json(HomeworkViewModel.FromHomework(homework, _mapper));
        }

        [HttpGet("course_homework/{courseId}")]
        public async Task<IActionResult> GetHomeworks(long courseId)
        {
            var course = await _courseRepository.GetAsync(c => c.Id == courseId);
            return course == null
                ? NotFound() as IActionResult
                : Json(course.Homeworks.Select(h => HomeworkViewModel.FromHomework(h, _mapper)));
        }

        [HttpPost("add_homework/{courseId}")]
        public async Task<IActionResult> AddHomework(long courseId, [FromBody]CreateHomeworkViewModel homeworkViewModel)
        {
            var homework = _mapper.Map<Homework>(homeworkViewModel);
            await _courseRepository.AddHomework(courseId, homework);

            return Ok(HomeworkViewModel.FromHomework(homework, _mapper));
        }

        [HttpPost("update_homework/{homeworkId}")]
        public async Task<IActionResult> UpdateHomework(long homeworkId, [FromBody]CreateHomeworkViewModel homework)
        {
            var updated = await _homeworkRepository.UpdateAsync(h => h.Id == homeworkId, h => new Homework() { Title = homework.Title });
            return Result(updated);
        }

        [HttpDelete("delete_homework/{homeworkId}")]
        public async Task<IActionResult> DeleteHomework(long homeworkId)
            => Result(await _homeworkRepository.DeleteAsync(h => h.Id == homeworkId));

        [HttpPost("add_application/{homeworkId}")]
        public async Task<IActionResult> AddApplication(long homeworkId, [FromBody]CreateHomeworkApplicationViewModel applicationViewModel)
        {
            var application = _mapper.Map<HomeworkApplication>(applicationViewModel);
            return Result(await _homeworkRepository.AddApplication(homeworkId, application));
        }

        [HttpPost("update_application/{applicationId}")]
        public async Task<IActionResult> UpdateApplication(long applicationId, [FromBody]CreateHomeworkApplicationViewModel applicationViewModel)
        {
            var updated = await _applicationRepository.UpdateAsync(a => a.Id == applicationId, a => new HomeworkApplication
            {
                Title = applicationViewModel.Title,
                Link = applicationViewModel.Link
            });

            return Result(updated);
        }

        [HttpDelete("delete_application/{applicationId}")]
        public async Task<IActionResult> DeleteApplication(long applicationId)
            => Result(await _applicationRepository.DeleteAsync(a => a.Id == applicationId));

        [HttpGet("get_task/{taskid}")]
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
            var homework = await _homeworkRepository.GetAsync(h => h.Id == homeworkId);
            if (homework == null)
            {
                return NotFound();
            }

            var task = _mapper.Map<HomeworkTask>(taskViewModel);
            task.HomeworkId = homeworkId;
            await _taskRepository.AddAsync(task);

            return Ok(task);
        }

        [HttpPost("update_task/{taskId}")]
        public async Task<IActionResult> UpdateTask(long taskId, [FromBody]CreateTaskViewModel taskViewModel)
        {
            var updated = await _taskRepository.UpdateAsync(t => t.Id == taskId, t => new HomeworkTask()
            {
                Title = taskViewModel.Title,
                Description = taskViewModel.Description
            });

            return Result(updated);
        }

        [HttpDelete("delete_task/{taskId}")]
        public async Task<IActionResult> DeleteTask(long taskId)
            => Result(await _taskRepository.DeleteAsync(t => t.Id == taskId));

        private IActionResult Result(bool flag)
            => flag
                ? Ok()
                : NotFound() as IActionResult;
    }
}
