using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;

namespace HwProj.CoursesService.API.Services
{
    public interface IAssignmentsService
    {
        public Task<bool> AssignStudentAsync(string studentId, string mentorId, long courseId);

        public Task DeassignStudentAsync(string studentId, long courseId);
    }
}
