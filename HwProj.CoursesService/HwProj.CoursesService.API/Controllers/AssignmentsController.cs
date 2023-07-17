using System.Threading.Tasks;
using HwProj.CoursesService.API.Filters;
using HwProj.CoursesService.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CoursesService.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[ServiceFilter(typeof(CourseMentorOnlyAttribute))]
public class AssignmentsController : Controller
{
    private readonly IAssignmentsService _assignmentsService;

    public AssignmentsController(IAssignmentsService assignmentsService)
    {
        _assignmentsService = assignmentsService;
    }

    [HttpPut("{courseId}/assignStudent/{studentId}")]
    public async Task AssignStudentToMentor(long courseId, [FromQuery] string mentorId, string studentId)
    {
        await _assignmentsService.AssignStudentAsync(studentId, mentorId, courseId);
    }

    [HttpDelete("{courseId}/deassignStudent/{studentId}")]
    public async Task DeassignStudentFromMentor(long courseId, string studentId)
    {
        await _assignmentsService.DeassignStudentAsync(studentId, courseId);
    }

    [HttpGet("{courseId}/getAssignments/")]
    public async Task<IActionResult> GetAllAssignmentsByCourse(long courseId)
    {
        return Ok(await _assignmentsService.GetAllAssignmentsByCourseAsync(courseId));
    }
}