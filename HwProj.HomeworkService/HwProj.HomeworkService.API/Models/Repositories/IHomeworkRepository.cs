using HwProj.CoursesService.API.Models.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.HomeworkService.API.Models.Repositories
{
    public interface IHomeworkRepository : ICrudRepository<Homework>
    {
        Task<bool> AddApplication(long homeworkId, HomeworkApplication application);
    }
}
