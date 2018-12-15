using HwProj.CoursesService.API.Models.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.HomeworkService.API.Models.Repositories
{
    public class ApplicationRepository : BaseRepository<HomeworkApplication>, IApplicationRepository
    {
        public ApplicationRepository(HomeworksContext context)
            : base(context)
        {

        }

        protected override IQueryable<HomeworkApplication> GetEntities()
            => GetAllEntites()
                .Include(a => a.Homework);
    }
}
