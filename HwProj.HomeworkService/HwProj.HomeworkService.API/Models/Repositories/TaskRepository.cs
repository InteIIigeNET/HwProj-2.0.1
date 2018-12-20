using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.HomeworkService.API.Models.Repositories
{
    public class TaskRepository : BaseRepository<HomeworkTask>, ITaskRepository
    {
        public TaskRepository(HomeworksContext context)
            : base(context)
        {

        }

        protected override IQueryable<HomeworkTask> GetEntities()
            => GetAllEntites().Include(t => t.Homework);
    }
}
