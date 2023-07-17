using HwProj.CoursesService.API.Models;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;

namespace HwProj.CoursesService.API.Services;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.CoursesService.API.Repositories;

public class AssignmentService : IAssignmentService
{
    private readonly IAssignmentsRepository _assignmentsRepository;

    public AssignmentService(IAssignmentsRepository assignmentsRepository)
    {
        _assignmentsRepository = assignmentsRepository;
    }

    public async Task AssignStudentAsync(string studentId, string mentorId, long courseId)
    {
        var student = _assignmentsRepository.FindAsync(a => a.CourseId == courseId && a.StudentId == studentId);

        if (student.Result != null)
        {
            await _assignmentsRepository.UpdateAsync(student.Result.Id, a => new Assignment()
            {
                MentorId = mentorId,
            });
        }
        else
        {
            await _assignmentsRepository.AddAsync(new Assignment
            {
                CourseId = courseId,
                StudentId = studentId,
                MentorId = mentorId
            });
        }
    }

    public Task DeassignStudentAsync(string studentId, long courseId);
}
