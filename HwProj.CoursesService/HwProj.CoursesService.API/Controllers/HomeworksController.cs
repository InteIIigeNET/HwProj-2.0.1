using System.Threading.Tasks;
using AutoMapper;
using FluentValidation;
using HwProj.CoursesService.API.Filters;
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
        private readonly IValidator<CreateHomeworkViewModel> _validator;

        public HomeworksController(IHomeworksService homeworksService, IMapper mapper, IValidator<CreateHomeworkViewModel> validator)
        {
            _homeworksService = homeworksService;
            _mapper = mapper;
            _validator = validator;
        }

        [HttpPost("{courseId}/add")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> AddHomework(long courseId, [FromBody] CreateHomeworkViewModel homeworkViewModel)
        {
            /*var validationResult = await _validator.ValidateAsync(homeworkViewModel);

            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.Errors);
            }*/

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
        public async Task UpdateHomework(long homeworkId, [FromBody] CreateHomeworkViewModel homeworkViewModel)
        {
            homeworkViewModel.InitializeDates();

            await _homeworksService.UpdateHomeworkAsync(homeworkId, new Homework
            {
                Title = homeworkViewModel.Title,
                Description = homeworkViewModel.Description,
                HasDeadline = homeworkViewModel.HasDeadline,
                DeadlineDate = homeworkViewModel.DeadlineDate,
                PublicationDate = homeworkViewModel.PublicationDate,
                IsDeadlineStrict = homeworkViewModel.IsDeadlineStrict,
            });
        }
    }
}
