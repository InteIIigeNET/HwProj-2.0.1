using System.Threading.Tasks;
using AutoMapper;
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
        public Solution[] GetAllSolutions()
        {
            return _solutionsService.GetAllSolutions();
        }

        [HttpGet("{solutionId}")]
        public async Task<IActionResult> GetSolution(long solutionId)
        {
            var solution = await _solutionsService.GetSolutionAsync(solutionId);
            return solution == null
                ? NotFound()
                : Ok(solution) as IActionResult;
        }

        [HttpGet("task_solutions/{taskId}/{studentId}")]
        public Solution[] GetTaskSolutionsFromStudent(long taskId, string studentId)
        {
            return _solutionsService.GetTaskSolutionsFromStudent(taskId, studentId);
        }

        [HttpPost("{taskId}")]
        public async Task<long> PostSolution(long taskId,
            [FromBody] SolutionViewModel solutionViewModel)
        {
            var solution = _mapper.Map<Solution>(solutionViewModel);
            var solutionId = await _solutionsService.AddSolutionAsync(taskId, solution);
            return solutionId;
        }

        [HttpPost("accept_solution/{solutionId}")]
        public async Task AcceptSolution(long solutionId)
        {
            await _solutionsService.AcceptSolutionAsync(solutionId);
        }

        [HttpPost("reject_solution/{solutionId}")]
        public async Task RejectSolution(long solutionId)
        {
            await _solutionsService.RejectSolutionAsync(solutionId);
        }

        [HttpDelete("{solutionId}")]
        public async Task DeleteSolution(long solutionId)
        {
            await _solutionsService.DeleteSolutionAsync(solutionId);
        }
    }
}