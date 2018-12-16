using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.HomeworkService.API.Models.Repositories
{
    public class HomeworkRepository : BaseRepository<Homework>, IHomeworkRepository
    {
        public HomeworkRepository(HomeworksContext context)
            : base(context)
        {

        }

        protected override IQueryable<Homework> GetEntities()
            => GetAllEntites()
                .Include(h => h.Applications)
                .Include(h => h.Course);

        public async Task<bool> AddApplication(long homeworkId, HomeworkApplication application)
        {
            var homework = await GetAsync(h => h.Id == homeworkId);
            if (homework == null)
            {
                return false;
            }

            homework.Applications.Add(application);
            await SaveAsync();
            return true;
        }
    }
}
