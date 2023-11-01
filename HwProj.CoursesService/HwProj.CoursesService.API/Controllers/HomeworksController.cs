using System.Threading.Tasks;
using AutoMapper;
using FluentValidation;
using HwProj.CoursesService.API.Filters;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Services;
using HwProj.CoursesService.API.Validators;
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
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> AddHomework(long courseId, [FromBody] CreateHomeworkViewModel homeworkViewModel)
        {
            var validator = new CreateHomeworkViewModelValidator(_mapper);

            var validationResult = await validator.ValidateAsync(homeworkViewModel);

            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.Errors);
            }

            var homework = _mapper.Map<Homework>(homeworkViewModel);
            var homeworkId = await _homeworksService.AddHomeworkAsync(courseId, homework);
            return Ok(homeworkId);
        }

        [HttpGet("get/{homeworkId}")]
        public async Task<HomeworkViewModel> GetHomework(long homeworkId)
        {
            var homeworkFromDb = await _homeworksService.GetHomeworkAsync(homeworkId);
            var homework = _mapper.Map<HomeworkViewModel>(homeworkFromDb);
            return homework;
        }

        [HttpGet("getForEditing/{homeworkId}")]
        public async Task<HomeworkViewModel> GetForEditingHomework(long homeworkId)
        {
            var homeworkFromDb = await _homeworksService.GetForEditingHomeworkAsync(homeworkId);
            var homework = _mapper.Map<HomeworkViewModel>(homeworkFromDb);
            return homework;
        }

        [HttpDelete("delete/{homeworkId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task DeleteHomework(long homeworkId)
        {
            await _homeworksService.DeleteHomeworkAsync(homeworkId);
        }

        [HttpPut("update/{homeworkId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> UpdateHomework(long homeworkId, [FromBody] CreateHomeworkViewModel homeworkViewModel)
        {
            var previousState = await _homeworksService.GetForEditingHomeworkAsync(homeworkId);
            var validator = new CreateHomeworkViewModelValidator(_mapper, previousState);

            var validationResult = await validator.ValidateAsync(homeworkViewModel);

            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.Errors);
            }

            await _homeworksService.UpdateHomeworkAsync(homeworkId, new Homework
            {
                Title = homeworkViewModel.Title,
                Description = homeworkViewModel.Description,
                HasDeadline = homeworkViewModel.HasDeadline,
                DeadlineDate = homeworkViewModel.DeadlineDate,
                PublicationDate = homeworkViewModel.PublicationDate,
                IsDeadlineStrict = homeworkViewModel.IsDeadlineStrict,
            });

            return Ok();
        }
    }
}
