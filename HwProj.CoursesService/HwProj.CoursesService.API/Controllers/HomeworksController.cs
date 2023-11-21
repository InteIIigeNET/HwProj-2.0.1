using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.API.Domains;
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

        public HomeworksController(IHomeworksService homeworksService, IMapper mapper)
        {
            _homeworksService = homeworksService;
            _mapper = mapper;
        }

        [HttpPost("{courseId}/add")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> AddHomework(long courseId, [FromBody] CreateHomeworkViewModel homeworkViewModel)
        {
            var validationResult = homeworkViewModel.Validate();

            if (validationResult.Count != 0)
            {
                return BadRequest(validationResult);
            }

            var homework = _mapper.Map<Homework>(homeworkViewModel);
            var homeworkId = await _homeworksService.AddHomeworkAsync(courseId, homework);
            return Ok(homeworkId);
        }

        [HttpGet("get/{homeworkId}")]
        public async Task<HomeworkViewModel> GetHomework(long homeworkId)
        {
            var homeworkFromDb = await _homeworksService.GetHomeworkAsync(homeworkId);
            var homework = homeworkFromDb.ToHomeworkViewModel();
            return homework;
        }

        [HttpGet("getForEditing/{homeworkId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<HomeworkViewModel> GetForEditingHomework(long homeworkId)
        {
            var homeworkFromDb = await _homeworksService.GetForEditingHomeworkAsync(homeworkId);
            var homework = homeworkFromDb.ToHomeworkViewModel();
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
            var validationResult = homeworkViewModel.Validate(await _homeworksService.GetHomeworkAsync(homeworkId));

            if (validationResult.Count != 0)
            {
                return BadRequest(string.Join(' ', validationResult));
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
