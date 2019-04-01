using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.SolutionsService.API.Models;
using HwProj.SolutionsService.API.Models.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.SolutionsService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SolutionsController : Controller
    {
        private readonly ISolutionRepository _solutionRepository;
        private readonly IMapper _mapper;

        public SolutionsController(ISolutionRepository solutionRepository, IMapper mapper)
        {
            _solutionRepository = solutionRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public List<SolutionViewModel> GetAllSolutions()
            => _solutionRepository.GetAll().Select(_mapper.Map<SolutionViewModel>).ToList();    
        
        [HttpGet("{solutionId}")]
        public async Task<IActionResult> GetSolution(long solutionId)
        {
            var solution = await _solutionRepository.GetAsync(solutionId);
            return solution == null
                ? NotFound()
                : Ok(_mapper.Map<SolutionViewModel>(solution)) as IActionResult;
        }

        [HttpPost("{taskId}")]
        public async Task<long> PostSolution(long taskId,
            [FromBody] CreateSolutionViewModel solutionViewModel)
        {
            var solution = await _solutionRepository
                .FindAsync(s => s.TaskId == taskId && s.StudentId == solutionViewModel.StudentId);
            
            if (solution == null)
            {
                solution = _mapper.Map<Solution>(solutionViewModel);
                solution.TaskId = taskId;
                await _solutionRepository.AddAsync(solution);
            }
            else
            {
                await _solutionRepository.UpdateAsync(solution.Id, s => new Solution()
                {
                    GithubUrl = solutionViewModel.GithubUrl,
                    Comment = solutionViewModel.Comment,
                    State = SolutionState.Posted
                });
            }

            return solution.Id;
        }

        [HttpPost("accept_solution/{solutionId}")]
        public async Task AcceptSolution(long solutionId)
            => await _solutionRepository.UpdateSolutionStateAsync(solutionId, SolutionState.Accepted);

        [HttpPost("reject_solution/{solutionId}")]
        public async Task RejectSolution(long solutionId)
            => await _solutionRepository.UpdateSolutionStateAsync(solutionId, SolutionState.Rejected);
        
        [HttpDelete("{solutionId}")]
        public async Task DeleteSolution(long solutionId)
            => await _solutionRepository.DeleteAsync(solutionId);
    }
}