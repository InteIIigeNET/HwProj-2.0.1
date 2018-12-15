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
        private readonly ICourseRepository _courseRepository;
        private readonly IMapper _mapper;

        public HomeworksController(IHomeworkRepository homeworkRepository, ICourseRepository courseRepository, IMapper mapper)
        {
            _homeworkRepository = homeworkRepository;
            _courseRepository = courseRepository;
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

        [HttpGet("all_homeworks/{courseId}")]
        public async Task<IActionResult> GetHomeworks(long courseId)
        {
            var course = await _courseRepository.GetAsync(c => c.Id == courseId);
            return course == null
                ? NotFound() as IActionResult
                : Json(course.Homeworks.Select(h => h.Id));
        }

        [HttpPost("{courseId}")]
        public async Task<IActionResult> AddHomework(long courseId, [FromBody]CreateHomeworkViewModel homeworkViewModel)
        {
            var homework = _mapper.Map<Homework>(homeworkViewModel);
            var added = await _courseRepository.AddHomework(courseId, homework);
            return added
                ? Ok()
                : NotFound() as IActionResult;
        }

        [HttpPost("add_application/{homeworkId}")]
        public async Task<IActionResult> AddApplication(long homeworkId, [FromBody]HomeworkApplicationViewModel applicationViewModel)
        {
            var application = _mapper.Map<HomeworkApplication>(applicationViewModel);
            var added = await _homeworkRepository.AddApplication(homeworkId, application);
            return added
                ? Ok()
                : NotFound() as IActionResult;
        }
    }
}
