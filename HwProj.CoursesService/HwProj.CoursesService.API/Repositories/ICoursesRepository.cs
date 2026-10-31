using System;
using System.Linq.Expressions;
using HwProj.CoursesService.API.Models;
using System.Threading.Tasks;
using HwProj.Repositories.Net8;

namespace HwProj.CoursesService.API.Repositories
{
    public interface ICoursesRepository : ICrudRepository<Course, long>
    {
        Task<Course?> GetWithCourseMates(long id);
        Task<Course?> GetWithHomeworksAsync(long id);

        Task<Course?> GetWithCourseMatesAndHomeworksAsync(long id, CourseLoadFilter? filter = null);

        Task<Course[]> GetAllWithCourseMatesAndHomeworksAsync(Expression<Func<Course, bool>> predicate,
            CourseLoadFilter? filter = null);

        Task<string> GetMentorIdsAsync(long id);
    }
}
