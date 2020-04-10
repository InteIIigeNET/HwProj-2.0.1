using HwProj.CourseWorkService.API.Models;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Repositories
{
    public interface IBidsRepository : ICrudRepository<Bid, long>
    {
    }
}
