using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.Repositories;

namespace HwProj.HomeworkService.API.Models.Repositories
{
    public interface IHomeworkRepository : ICrudRepository<Homework>
    {
        Task<List<Homework>> GetAllWithTasksAsync();
        Task<Homework> GetWithTasksAsync(long id);
    }
}