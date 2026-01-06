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
        private readonly ITasksService _tasksService;

        public HomeworksController(IHomeworksService homeworksService, ITasksService tasksService)
        {
            _homeworksService = homeworksService;
            _tasksService = tasksService;
        }

        [HttpPost("{courseId}/add")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> AddHomework(long courseId,
            [FromBody] CreateHomeworkViewModel homeworkViewModel)
        {
            var validationResult = Validator.ValidateHomework(homeworkViewModel);
            if (validationResult.Any()) return BadRequest(validationResult);

            var newHomework = await _homeworksService.AddHomeworkAsync(courseId, homeworkViewModel);
            var responseViewModel = newHomework.ToHomeworkViewModel();

            await FillLtiUrls(responseViewModel);

            return Ok(responseViewModel);
        }

        [HttpGet("get/{homeworkId}")]
        public async Task<HomeworkViewModel> GetHomework(long homeworkId)
        {
            var homeworkFromDb = await _homeworksService.GetHomeworkAsync(homeworkId);
            var homeworkViewModel = homeworkFromDb.ToHomeworkViewModel();

            await FillLtiUrls(homeworkViewModel);

            return homeworkViewModel;
        }

        [HttpGet("getForEditing/{homeworkId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<HomeworkViewModel> GetForEditingHomework(long homeworkId)
        {
            var homeworkFromDb = await _homeworksService.GetForEditingHomeworkAsync(homeworkId);
            var homeworkViewModel = homeworkFromDb.ToHomeworkViewModel();

            await FillLtiUrls(homeworkViewModel);

            return homeworkViewModel;
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
            var responseViewModel = updatedHomework.ToHomeworkViewModel();

            await FillLtiUrls(responseViewModel);

            return Ok(responseViewModel);
        }

        private async Task FillLtiUrls(HomeworkViewModel viewModel)
        {
            if (viewModel.Tasks != null && viewModel.Tasks.Any())
            {
                var taskIds = viewModel.Tasks.Select(t => t.Id).ToArray();
                var ltiUrls = await _tasksService.GetLtiUrlsForTasksAsync(taskIds);

                foreach (var task in viewModel.Tasks)
                {
                    if (ltiUrls.TryGetValue(task.Id, out var url))
                    {
                        task.LtiLaunchUrl = url;
                    }
                }
            }
        }
    }
}