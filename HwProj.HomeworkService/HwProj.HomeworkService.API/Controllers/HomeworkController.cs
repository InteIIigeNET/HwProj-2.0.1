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
        private readonly IMapper _mapper;

        public HomeworkController(IHomeworkRepository homeworkRepository, ICourseRepository courseRepository, IApplicationRepository applicationRepository, IMapper mapper)
        {
            _homeworkRepository = homeworkRepository;
            _courseRepository = courseRepository;
            _applicationRepository = applicationRepository;
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
                : Json(course.Homeworks.Select(h => h.Id));
        }

        [HttpPost("add_homework/{courseId}")]
        public async Task<IActionResult> AddHomework(long courseId, [FromBody]CreateHomeworkViewModel homeworkViewModel)
        {
            var homework = _mapper.Map<Homework>(homeworkViewModel);
            return Result(await _courseRepository.AddHomework(courseId, homework));
        }

        [HttpPost("update_homework/{homeworkId}")]
        public async Task<IActionResult> UpdateHomework(long homeworkId, [FromBody]CreateHomeworkViewModel homework)
        {
            var updated = await _homeworkRepository.UpdateAsync(h => h.Id == homeworkId, h => new Homework() { Name = homework.Name });
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
                Name = applicationViewModel.Name,
                Link = applicationViewModel.Link
            });

            return Result(updated);
        }

        [HttpDelete("delete_application/{applicationId}")]
        public async Task<IActionResult> DeleteApplication(long applicationId)
            => Result(await _applicationRepository.DeleteAsync(a => a.Id == applicationId));

        private IActionResult Result(bool flag)
            => flag
                ? Ok()
                : NotFound() as IActionResult;
    }
}
