using System.Threading.Tasks;
using HwProj.CoursesService.API.Domains;
using HwProj.CoursesService.API.Filters;
using HwProj.CoursesService.API.Services;
using HwProj.Models.CoursesService.ViewModels;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using HwProj.Models;
using HwProj.Utils.Authorization;

namespace HwProj.CoursesService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HomeworksController : Controller
    {
        private readonly IHomeworksService _homeworksService;
        private readonly ICoursesService _coursesService;

        public HomeworksController(IHomeworksService homeworksService, ICoursesService coursesService)
        {
            _homeworksService = homeworksService;
            _coursesService = coursesService;
        }

        [HttpPost("{courseId}/add")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> AddHomework(long courseId,
            [FromBody] CreateHomeworkViewModel homeworkViewModel)
        {
            var validationResult = Validator.ValidateHomework(homeworkViewModel);
            if (validationResult.Any()) return BadRequest(validationResult);

            var homework = homeworkViewModel.ToHomework();
            var newHomework = await _homeworksService.AddHomeworkAsync(courseId, homework);
            return Ok(newHomework.ToHomeworkViewModel());
        }

        [HttpGet("get/{homeworkId}")]
        public async Task<IActionResult> GetHomework(long homeworkId)
        {
            var userId = Request.GetUserIdFromHeader();
            var homeworkFromDb = await _homeworksService.GetHomeworkAsync(homeworkId);

            if (!await _coursesService.IsCourseUser(homeworkFromDb.CourseId, userId))
            {
                return Forbid();
            }

            var homework = homeworkFromDb.ToHomeworkViewModel();
            return Ok(homework);
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

            var updatedHomework =
                await _homeworksService.UpdateHomeworkAsync(homeworkId, homeworkViewModel.ToHomework(),
                    homeworkViewModel.ActionOptions ?? ActionOptions.Default);
            return Ok(updatedHomework.ToHomeworkViewModel());
        }
    }
}
