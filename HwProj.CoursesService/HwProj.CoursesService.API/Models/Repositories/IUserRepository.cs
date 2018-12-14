using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Models.Repositories
{
    public interface IUserRepository : ICrudRepository<User>
    {
        Task<User> GetAsync(string id);
    }
}
