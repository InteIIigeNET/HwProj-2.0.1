using System.Threading.Tasks;
using AutoMapper;
using HwProj.SolutionsService.API.Models;
using HwProj.SolutionsService.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.SolutionsService.API.Controllers
{
    [Route("api/[controller]/{groupId}")]
    [ApiController]
    public class GroupSolutionsController : Controller
    {
        private readonly ISolutionsService _solutionsService;
        private readonly IMapper _mapper;

        public GroupSolutionsController(ISolutionsService solutionsService, IMapper mapper)
        {
            _solutionsService = solutionsService;
            _mapper = mapper;
        }

        [HttpPost("{taskId}")]
        public async Task<long> PostSolution(long groupId, long taskId, [FromBody] SolutionViewModel solutionViewModel)
        {
            var solution = _mapper.Map<Solution>(solutionViewModel);
            solution.GroupId = groupId;
            var solutionId = await _solutionsService.AddSolutionAsync(taskId, solution);
            return solutionId;
        }

        [HttpGet("task_solutions/{taskId}")]
        public async Task<Solution[]> GetTaskSolutionsFromGroup(long groupId, long taskId)
        {
            return await _solutionsService.GetTaskSolutionsFromGroupAsync(taskId, groupId);
        }
    }
}
