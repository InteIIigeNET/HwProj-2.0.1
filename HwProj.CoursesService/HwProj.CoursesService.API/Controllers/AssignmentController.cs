using System.Threading.Tasks;
using HwProj.CoursesService.API.Filters;
using AutoMapper;
using HwProj.CoursesService.API.Services;
using HwProj.Models.CoursesService.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CoursesService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AssignmentsController : Controller
    {
        private readonly IAssignmentsService _assignmentsService;
        private IMapper _mapper;

        public AssignmentsController(IAssignmentsService assignmentsService,
            IMapper mapper)
        {
            _assignmentsService = assignmentsService;
            _mapper = mapper;
        }

        [HttpPut("{courseId}/assignStudent")]
        public async Task AssignStudentToMentor(long courseId, [FromQuery] string studentId, [FromQuery] string mentorId)
        {
            await _assignmentsService.AssignStudentAsync(studentId, mentorId, courseId);
        }

        [HttpDelete("{courseId}/deassignStudent")]
        public async Task DeassignStudentFromMentor(long courseId, [FromQuery] string studentId)
        {
            await _assignmentsService.DeassignStudentAsync(studentId, courseId);
        }
    }
}