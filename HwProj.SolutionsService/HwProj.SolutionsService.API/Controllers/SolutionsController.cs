using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HwProj.SolutionsService.API.Models.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.SolutionsService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SolutionsController : Controller
    {
        private readonly ISolutionRepository _solutionRepository;

        public SolutionsController(ISolutionRepository solutionRepository)
        {
            _solutionRepository = solutionRepository;
        }
    }
}