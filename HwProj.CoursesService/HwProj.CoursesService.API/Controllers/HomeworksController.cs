using System.Threading.Tasks;
using HwProj.CoursesService.API.Domains;
using HwProj.CoursesService.API.Filters;
using HwProj.CoursesService.API.Services;
using HwProj.Models.CoursesService.ViewModels;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace HwProj.CoursesService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HomeworksController : Controller
    {
        private readonly IHomeworksService _homeworksService;

        public HomeworksController(IHomeworksService homeworksService)
        {
            _homeworksService = homeworksService;
        }

        [HttpPost("{courseId}/add")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> AddHomework(long courseId,
            [FromBody] CreateHomeworkViewModel homeworkViewModel)
        {
            var validationResult = Validator.ValidateHomework(homeworkViewModel);
            if (validationResult.Any()) return BadRequest(validationResult);

            var newHomework = await _homeworksService.AddHomeworkAsync(courseId, homeworkViewModel);
            return Ok(newHomework.ToHomeworkViewModel());
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
        public async Task<IActionResult> UpdateHomework(long homeworkId,
            [FromBody] CreateHomeworkViewModel homeworkViewModel)
        {
            var homework = await _homeworksService.GetForEditingHomeworkAsync(homeworkId);
            var validationResult = Validator.ValidateHomework(homeworkViewModel, homework);
            if (validationResult.Any()) return BadRequest(validationResult);

            var updatedHomework = await _homeworksService.UpdateHomeworkAsync(homeworkId, homeworkViewModel);
            return Ok(updatedHomework.ToHomeworkViewModel());
        }
    }
}
