using System.Linq;
using System.Threading.Tasks;
using HwProj.HomeworkService.API.Models;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.HomeworkService.API.Repositories
{
    public class HomeworksRepository : CrudRepository<Homework>, IHomeworksRepository
    {
        public HomeworksRepository(HomeworkContext context)
            : base(context)
        {
        }
        
        public Task<Homework[]> GetAllWithTasksAsync()
            => _context.Set<Homework>().Include(h => h.Tasks).ToArrayAsync();

        public Task<Homework[]> GetAllWithTasksByCourseAsync(long courseId)
            => _context.Set<Homework>().Include(h => h.Tasks)
                                       .Where(h => h.CourseId == courseId)
                                       .ToArrayAsync();

        public Task<Homework> GetWithTasksAsync(long id)
            => _context.Set<Homework>().Include(h => h.Tasks).FirstOrDefaultAsync(h => h.Id == id);
    }
}