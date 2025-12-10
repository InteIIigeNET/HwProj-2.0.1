using HwProj.CoursesService.API.Models;
using HwProj.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Repositories
{
    public interface ICriterionsRepository : ICrudRepository<Criterions, long>
    {
        Task<Criterions> GetCriterions(long id);

        Task<List<Criterions>> GetByTaskIdAsync(long taskId);

    }
}
