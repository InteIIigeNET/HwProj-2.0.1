using HwProj.CoursesService.API.Models;
using HwProj.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Repositories
{
    public interface ICriterionsRepository : ICrudRepository<Criterion, long>
    {

        Task<List<Criterion>> GetByTaskIdAsync(long taskId);

    }
}
