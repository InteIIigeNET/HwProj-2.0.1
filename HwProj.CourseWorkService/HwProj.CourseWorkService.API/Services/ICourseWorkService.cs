using System;
using System.Linq.Expressions;
using HwProj.CourseWorkService.API.Models;
using System.Threading.Tasks;

namespace HwProj.CourseWorkService.API.Services
{
    public interface ICourseWorkService
    {
        Task<CourseWork> GetCourseWorkAsync(long courseWorkId);
        Task<CourseWork> GetStudentCourseWorkAsync(long studentId);
        Task<CourseWork[]> GetFilteredCourseWorksAsync(Expression<Func<CourseWork, bool>> predicate); 

        Task<long> AddCourseWorkAsync(CourseWork courseWork);
        Task DeleteCourseWorkAsync(long courseWorkId);
        Task UpdateCourseWorkAsync(long courseWorkId, CourseWork update);

        Task<bool> AcceptStudentAsync(long courseWorkId, long studentId);
        Task<bool> RejectStudentAsync(long courseWorkId, long studentId);
    }
}
