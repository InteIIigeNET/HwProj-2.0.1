using System.Threading.Tasks;
using AutoMapper;
using HwProj.Models.SolutionsService;
using HwProj.SolutionsService.API.Models;
using HwProj.SolutionsService.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.SolutionsService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SolutionsController : Controller
    {
        private readonly ISolutionsService _solutionsService;
        private readonly IMapper _mapper;

        public SolutionsController(ISolutionsService solutionsService, IMapper mapper)
        {
            _solutionsService = solutionsService;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<Solution[]> GetAllSolutions()
        {
            return await _solutionsService.GetAllSolutionsAsync();
        }

        [HttpGet("{solutionId}")]
        public async Task<IActionResult> GetSolution(long solutionId)
        {
            var solution = await _solutionsService.GetSolutionAsync(solutionId);
            return solution == null
                ? NotFound()
                : Ok(solution) as IActionResult;
        }

        [HttpGet("taskSolutions/{taskId}/{studentId}")]
        public async Task<Solution[]> GetTaskSolutionsFromStudent(long taskId, string studentId)
        {
            return await _solutionsService.GetTaskSolutionsFromStudentAsync(taskId, studentId);
        }

        [HttpPost("{taskId}")]
        public async Task<long> PostSolution(long taskId, [FromBody] SolutionViewModel solutionViewModel)
        {
            var solution = _mapper.Map<Solution>(solutionViewModel);
            var solutionId = await _solutionsService.AddSolutionAsync(taskId, solution);
            return solutionId;
        }

        [HttpPost("rateSolution/{solutionId}")]
        public async Task RateSolution(long solutionId, [FromQuery] int newRating)
        {
            await _solutionsService.RateSolutionAsync(solutionId, newRating);
        }
        
        [HttpPost("markSolutionFinal/{solutionId}")]
        public async Task MarkSolutionFinal(long solutionId)
        {
            await _solutionsService.MarkSolutionFinal(solutionId);
        }

        [HttpDelete("delete/{solutionId}")]
        public async Task DeleteSolution(long solutionId)
        {
            await _solutionsService.DeleteSolutionAsync(solutionId);
        }
        
        [HttpPost("{groupId}/{taskId}")]
        public async Task<long> PostSolution(long groupId, long taskId, [FromBody] SolutionViewModel solutionViewModel)
        {
            var solution = _mapper.Map<Solution>(solutionViewModel);
            solution.GroupId = groupId;
            var solutionId = await _solutionsService.AddSolutionAsync(taskId, solution);
            return solutionId;
        }

        [HttpGet("{groupId}/taskSolutions/{taskId}")]
        public async Task<Solution[]> GetTaskSolutionsFromGroup(long groupId, long taskId)
        {
            return await _solutionsService.GetTaskSolutionsFromGroupAsync(taskId, groupId);
        }
    }
}
