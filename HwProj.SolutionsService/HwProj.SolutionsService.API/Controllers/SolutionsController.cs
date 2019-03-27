using System;
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
        public async Task<List<SolutionViewModel>> GetSolution(long solutionId)
        {
            var solution = await _solutionRepository.GetAsync(solutionId);
            return solution == null
                ? new List<SolutionViewModel>()
                : new List<SolutionViewModel> {_mapper.Map<SolutionViewModel>(solution)};
        }

        [HttpPost("{taskId}")]
        public async Task<List<SolutionViewModel>> AddSolution(long taskId,
            [FromBody] CreateSolutionViewModel solutionViewModel)
        {
            var solution = _mapper.Map<Solution>(solutionViewModel);
            solution.TaskId = taskId;
            await _solutionRepository.AddAsync(solution);

            return new List<SolutionViewModel> {_mapper.Map<SolutionViewModel>(solution)};
        }

        [HttpPost("accept_solution/{solutionId}")]
        public async Task AcceptSolution(long solutionId)
            => await _solutionRepository.UpdateAsync(solutionId, solution => new Solution() { State = Solution.SolutionState.Accepted});
        
        [HttpPost("reject_solution/{solutionId}")]
        public async Task RejectSolution(long solutionId)
            => await _solutionRepository.UpdateAsync(solutionId, solution => new Solution() { State = Solution.SolutionState.Rejected});
    }
}