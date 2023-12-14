using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CoursesService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AssignmentsController : Controller
    {
        private readonly IAssignmentsService _assignmentsService;

        public AssignmentsController(IAssignmentsService assignmentsService,
            IMapper mapper)
        {
            _assignmentsService = assignmentsService;
        }

        [HttpPut("{courseId}/assignStudent")]
        public async Task<IActionResult> AssignStudentToMentor(long courseId, [FromQuery] string studentId, [FromQuery] string mentorId)
        {
            return await _assignmentsService.AssignStudentAsync(studentId, mentorId, courseId)
                ? Ok()
                : NotFound();
        }

        [HttpDelete("{courseId}/deassignStudent")]
        public async Task DeassignStudentFromMentor(long courseId, [FromQuery] string studentId)
        {
            await _assignmentsService.DeassignStudentAsync(studentId, courseId);
        }
    }
}