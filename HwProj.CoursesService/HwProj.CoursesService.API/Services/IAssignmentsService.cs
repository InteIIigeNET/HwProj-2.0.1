using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;

namespace HwProj.CoursesService.API.Services;

public interface IAssignmentsService
{
    public Task AssignStudentAsync(string studentId, string mentorId, long courseId);

    public Task DeassignStudentAsync(string studentId, long courseId);

    public Task<Assignment[]> GetAllAssignmentsByCourseAsync(long courseId);

}