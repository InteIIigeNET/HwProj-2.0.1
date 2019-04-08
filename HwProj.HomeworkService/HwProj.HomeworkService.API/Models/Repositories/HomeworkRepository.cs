using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.HomeworkService.API.Models.Repositories
{
    public class HomeworkRepository : CrudRepository<Homework>, IHomeworkRepository
    {
        public HomeworkRepository(HomeworkContext context)
            : base(context)
        {
        }
        
        public Task<List<Homework>> GetAllWithTasksAsync()
            => _context.Set<Homework>().Include(h => h.Tasks).ToListAsync();

        public Task<Homework> GetWithTasksAsync(long id)
            => _context.Set<Homework>().Include(h => h.Tasks).FirstOrDefaultAsync(h => h.Id == id);
    }
}