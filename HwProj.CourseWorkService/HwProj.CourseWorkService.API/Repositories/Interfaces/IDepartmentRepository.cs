using HwProj.CourseWorkService.API.Models;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Repositories.Interfaces
{
    public interface IDepartmentRepository : ICrudRepository<Department, long>
    {
    }
}
