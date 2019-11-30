using HwProj.CourseWorkService.API.Models;
using System.Threading.Tasks;

namespace HwProj.CourseWorkService.API.Services
{
    public interface ICourseWorkService
    {
        Task<CourseWork> GetCourseWorkAsync(long courseWorkId);
        Task<CourseWork> GetStudentCourseWorkAsync(string studentId);
        Task<CourseWork[]> GetFilteredCourseWorksAsync(Filter filter); 

        Task<long> AddCourseWorkAsync(CourseWork courseWork, string supervisorId, bool wasCreatedBySupervisor);
        Task DeleteCourseWorkAsync(long courseWorkId);
        Task UpdateCourseWorkAsync(long courseWorkId, CourseWork update);

        Task<bool> AcceptStudentAsync(long courseWorkId, string studentId);
        Task<bool> RejectStudentAsync(long courseWorkId, string studentId);
    }
}
