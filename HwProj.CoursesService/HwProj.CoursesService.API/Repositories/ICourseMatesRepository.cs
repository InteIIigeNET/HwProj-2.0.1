using HwProj.CoursesService.API.Models;
using HwProj.Repositories.Net8;

namespace HwProj.CoursesService.API.Repositories
{
    public interface ICourseMatesRepository : ICrudRepository<CourseMate, long>
    {
    }
}