using HwProj.CourseWorkService.API.Models;
using System.Threading.Tasks;

namespace HwProj.CourseWorkService.API.Services
{
    public interface ICourseWorkService : IEntityService<CourseWork>
    {
        Task<CourseWork> GetStudentCourseWorkAsync(long studentId);

        Task<bool> AcceptStudentAsync(long courseWorkId, long studentId);
        Task<bool> RejectStudentAsync(long courseWorkId, long studentId);
    }
}
