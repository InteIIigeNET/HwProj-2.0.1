using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Repositories.Interfaces;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Repositories.Implementations
{
    public class DepartmentRepository : CrudRepository<Department, long>, IDepartmentRepository
    {
        public DepartmentRepository(CourseWorkContext context) : base(context)
        {

        }
    }
}
