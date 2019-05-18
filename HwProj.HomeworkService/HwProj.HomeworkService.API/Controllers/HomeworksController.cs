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
        private readonly IMapper _mapper;

        public HomeworksController(IHomeworkRepository homeworkRepository, IMapper mapper)
        {
            _homeworkRepository = homeworkRepository;
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

        [HttpGet("course_homeworks/{courseId}")]
        public async Task<List<HomeworkViewModel>> GetCourseHomeworks(long courseId)
            => _mapper.Map<List<HomeworkViewModel>>((await _homeworkRepository.GetAllWithTasksAsync())
                .Where(hw => hw.CourseId == courseId));

        [HttpPost("{courseId}")]
        public async Task<long> AddHomework(long courseId,
            [FromBody] CreateHomeworkViewModel homeworkViewModel)
        {
            var homework = _mapper.Map<Homework>(homeworkViewModel);
            homework.CourseId = courseId;
            homework.Date = DateTime.Now;
            return await _homeworkRepository.AddAsync(homework);
        }

        [HttpDelete("{homeworkId}")]
        public async Task DeleteHomework(long homeworkId)
            => await _homeworkRepository.DeleteAsync(homeworkId);

        [HttpPost("update/{homeworkId}")]
        public async Task UpdateHomework(long homeworkId,
            [FromBody] CreateHomeworkViewModel homeworkViewModel)
        {
            await _homeworkRepository.UpdateAsync(homeworkId, homework => new Homework()
            {
                Title = homeworkViewModel.Title,
                Description = homeworkViewModel.Description
            });
        }
    }
}
