using System.Threading.Tasks;
using AutoMapper;
using HwProj.HomeworkService.API.Models;
using HwProj.HomeworkService.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.HomeworkService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HomeworksController : Controller
    {
        private readonly IHomeworksService _homeworksService;
        private readonly IMapper _mapper;

        public HomeworksController(IHomeworksService homeworksService, IMapper mapper)
        {
            _homeworksService = homeworksService;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<HomeworkViewModel[]> GetAllHomeworks()
        {
            var homeworks = await _homeworksService.GetAllHomeworksAsync();
            return _mapper.Map<HomeworkViewModel[]>(homeworks);
        }

        [HttpGet("{homeworkId}")]
        public async Task<IActionResult> GetHomework(long homeworkId)
        {
            var homework = await _homeworksService.GetHomeworkAsync(homeworkId);

            if (homework == null)
            {
                return NotFound();
            }
            return Ok(_mapper.Map<HomeworkViewModel>(homework));
        }

        [HttpGet("course_homeworks/{courseId}")]
        public async Task<HomeworkViewModel[]> GetCourseHomeworks(long courseId)
        {
            var homeworks = await _homeworksService.GetCourseHomeworksAsync(courseId);
            return _mapper.Map<HomeworkViewModel[]>(homeworks);
        }

        [HttpPost("{courseId}")]
        public async Task<long> AddHomework(long courseId,
            [FromBody] CreateHomeworkViewModel homeworkViewModel)
        {
            var homework = _mapper.Map<Homework>(homeworkViewModel);
            var homeworkId = await _homeworksService.AddHomeworkAsync(courseId, homework);
            return homeworkId;
        }

        [HttpDelete("{homeworkId}")]
        public async Task DeleteHomework(long homeworkId)
        {
            await _homeworksService.DeleteHomeworkAsync(homeworkId);
        }

        [HttpPost("update/{homeworkId}")]
        public async Task UpdateHomework(long homeworkId,
            [FromBody] CreateHomeworkViewModel homeworkViewModel)
        {
            await _homeworksService.UpdateHomeworkAsync(homeworkId, new Homework()
            {
                Title = homeworkViewModel.Title,
                Description = homeworkViewModel.Description
            });
        }
    }
}
