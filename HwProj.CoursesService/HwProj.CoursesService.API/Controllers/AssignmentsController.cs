using System.Threading.Tasks;
using HwProj.CoursesService.API.Filters;
using HwProj.CoursesService.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CoursesService.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AssignmentsController : Controller
{
    private readonly IAssignmentsService _assignmentsService;

    public AssignmentsController(IAssignmentsService assignmentsService)
    {
        _assignmentsService = assignmentsService;
    }

    [HttpPut("{courseId}/assignStudent/{studentId}")]
    [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
    public async Task AssignStudentToMentor(long courseId, [FromQuery] string mentorId, string studentId)
    {
        await _assignmentsService.AssignStudentAsync(studentId, mentorId, courseId);
    }

    [HttpDelete("{courseId}/deassignStudent/{studentId}")]
    [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
    public async Task DeassignStudentFromMentor(long courseId, string studentId)
    {
        await _assignmentsService.DeassignStudentAsync(studentId, courseId);
    }
}