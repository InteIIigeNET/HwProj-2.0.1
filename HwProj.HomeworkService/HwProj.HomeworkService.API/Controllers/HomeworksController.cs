using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.HomeworkService.API.Models;
using HwProj.HomeworkService.API.Models.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.HomeworkService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HomeworksController : Controller
    {
        private readonly IHomeworkRepository _homeworkRepository;
        private readonly ITaskRepository _taskRepository;
        private readonly IMapper _mapper;

        public HomeworksController(ITaskRepository taskRepository, IHomeworkRepository homeworkRepository,
            IMapper mapper)
        {
            _homeworkRepository = homeworkRepository;
            _taskRepository = taskRepository;
            _mapper = mapper;
        }

        [HttpPost("add_homework/{courseId}")]
        public async Task<List<HomeworkViewModel>> AddHomework(long courseId, [FromBody] CreateHomeworkViewModel homeworkViewModel)
        {
            var homework = _mapper.Map<Homework>(homeworkViewModel);
            homework.CourseId = courseId;
            await _homeworkRepository.AddAsync(homework);
            return new List<HomeworkViewModel> { _mapper.Map<HomeworkViewModel>(homework) };
        }
    }
}
