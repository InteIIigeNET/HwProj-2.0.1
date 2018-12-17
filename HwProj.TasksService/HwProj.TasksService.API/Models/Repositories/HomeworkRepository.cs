using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.TasksService.API.Models.Repositories
{
    public class HomeworkRepository : BaseRepository<Homework>, IHomeworkRepository
    {
        public HomeworkRepository(TaskContext context)
            : base(context)
        {
        }

        protected override IQueryable<Homework> GetEntities()
            => GetAllEntites()
                .Include(h => h.Tasks);

        public async Task AddTask(long homeworkId, HomeworkTask task)
        {
            var homework = await GetAsync(h => h.Id == homeworkId);
            if (homework == null)
            {
                homework = new Homework() { Id = homeworkId };
                await AddAsync(homework);
            }

            homework.Tasks.Add(task);
            await SaveAsync();
        }
    }
}
