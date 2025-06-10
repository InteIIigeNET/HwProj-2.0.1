using HwProj.CoursesService.API.Models;
using HwProj.Repositories;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Repositories
{
    public interface IDescriptionsRepository : ICrudRepository<CourseDescription, long>
    {
        public Task<CourseDescription?> GetDescriptionAsync(long courseId);

        public Task ChangeOrAdd(long courseId, string description);
    }
}
