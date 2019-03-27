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

        [HttpGet("{solutionId}")]
        public async Task<List<Solution>> GetSolution(long solutionId)
        {
            var solution = await _solutionRepository.GetAsync(solutionId);
            return solution == null
                ? new List<Solution>()
                : new List<Solution> {solution};
        }

        [HttpPost("{taskId}")]
        public async Task<List<Solution>> AddSolution(long taskId,
            [FromBody] CreateSolutionViewModel solutionViewModel)
        {
            var solution = _mapper.Map<Solution>(solutionViewModel);
            solution.TaskId = taskId;
            await _solutionRepository.AddAsync(solution);

            return new List<Solution> {solution};
        }
        
    }
}