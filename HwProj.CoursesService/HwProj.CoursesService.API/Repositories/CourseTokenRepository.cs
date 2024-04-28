using HwProj.CoursesService.API.Models;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Repositories
{
    public interface ICourseTokenRepository : ICrudRepository<CourseToken, long>
    {
    }

    public class CourseTokenRepository : CrudRepository<CourseToken, long>, ICourseTokenRepository
    {
        public CourseTokenRepository(CourseContext context) : base(context)
        {
        }
    }
}