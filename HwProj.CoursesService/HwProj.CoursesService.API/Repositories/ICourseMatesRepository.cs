using HwProj.Repositories;
using HwProj.CoursesService.API.Models;

namespace HwProj.CoursesService.API.Repositories
{
    public interface ICourseMatesRepository : ICrudRepository<CourseMate, long>
    {
    }
}