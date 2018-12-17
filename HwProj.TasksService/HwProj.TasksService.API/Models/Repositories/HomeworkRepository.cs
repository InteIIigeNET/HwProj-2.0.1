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
    }
}
