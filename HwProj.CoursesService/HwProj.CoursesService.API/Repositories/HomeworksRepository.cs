﻿using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Repositories
{
    public class HomeworksRepository : CrudRepository<Homework, long>, IHomeworksRepository
    {
        public HomeworksRepository(CourseContext context)
            : base(context)
        {
        }

        public async Task<Homework[]> GetAllWithTasksAsync()
        {
            return await Context.Set<Homework>().AsNoTracking().Include(h => h.Tasks).ToArrayAsync();
        }

        public async Task<Homework[]> GetAllWithTasksByCourseAsync(long courseId)
        {
            return await Context.Set<Homework>()
                .AsNoTracking()
                .Include(h => h.Tasks)
                .Where(h => h.CourseId == courseId)
                .ToArrayAsync();
        }

        public async Task<Homework> GetWithTasksAsync(long id)
        {
            return await Context.Set<Homework>().AsNoTracking().Include(h => h.Tasks)
                .FirstOrDefaultAsync(h => h.Id == id);
        }
    }
}
