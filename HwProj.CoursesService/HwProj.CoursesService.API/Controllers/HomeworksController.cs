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
    public class HomeworksController : Controller
    {
        private readonly IHomeworksService _homeworksService;
        private readonly IMapper _mapper;

        public HomeworksController(IHomeworksService homeworksService, IMapper mapper)
        {
            _homeworksService = homeworksService;
            _mapper = mapper;
        }

        [HttpPost("{courseId}/add")]
        public async Task<long> AddHomework(long courseId, [FromBody] CreateHomeworkViewModel homeworkViewModel)
        {
            var homework = _mapper.Map<Homework>(homeworkViewModel);
            var homeworkId = await _homeworksService.AddHomeworkAsync(courseId, homework);
            return homeworkId;
        }

        [HttpGet("get/{homeworkId}")]
        public async Task<HomeworkViewModel> GetHomework(long homeworkId)
        {
            var homework = await _homeworksService.GetHomeworkAsync(homeworkId);
            return _mapper.Map<HomeworkViewModel>(homework);
        }

        [HttpDelete("delete/{homeworkId}")]
        public async Task DeleteHomework(long homeworkId)
        {
            await _homeworksService.DeleteHomeworkAsync(homeworkId);
        }

        [HttpPut("update/{homeworkId}")]
        public async Task UpdateHomework(long homeworkId, [FromBody] CreateHomeworkViewModel homeworkViewModel)
        {
            await _homeworksService.UpdateHomeworkAsync(homeworkId, new Homework
            {
                Title = homeworkViewModel.Title,
                Description = homeworkViewModel.Description
            });
        }
    }
}
