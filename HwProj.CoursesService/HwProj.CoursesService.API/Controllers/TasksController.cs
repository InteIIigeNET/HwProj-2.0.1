using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
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
        private readonly ICoursesService _coursesService;
        private readonly IHomeworksRepository _homeworksRepository;


        public TasksController(ITasksService tasksService, IMapper mapper, ICoursesService coursesService, IHomeworksRepository homeworksRepository)
        {
            _tasksService = tasksService;
            _mapper = mapper;
            _coursesService = coursesService;
            _homeworksRepository = homeworksRepository;
        }

        [HttpGet("get/{taskId}")]
        public async Task<IActionResult> GetTask(long taskId)
        {
            var userId = Request.GetUserIdFromHeader();
            var taskFromDb = await _tasksService.GetTaskAsync(taskId);
            if (taskFromDb == null) return NotFound();

            if (taskFromDb.PublicationDate > DateTimeUtils.GetMoscowNow())
            {
                var homework = await _homeworksRepository.GetAsync(taskFromDb.HomeworkId);
                var lecturers = await _coursesService.GetCourseLecturers(homework.CourseId);
                if (!lecturers.Contains(userId)) return BadRequest();
            }
            
            var task = _mapper.Map<HomeworkTaskViewModel>(taskFromDb);
            return Ok(task);
        }

        [HttpPost("{homeworkId}/add")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<long> AddTask(long homeworkId, [FromBody] CreateTaskViewModel taskViewModel)
        {
            taskViewModel.InitializeDeadline();
            var task = _mapper.Map<HomeworkTask>(taskViewModel);
            var taskId = await _tasksService.AddTaskAsync(homeworkId, task);
            return taskId;
        }

        [HttpDelete("delete/{taskId}")] //bug with rights
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task DeleteTask(long taskId)
        {
            await _tasksService.DeleteTaskAsync(taskId);
        }

        [HttpPut("update/{taskId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
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