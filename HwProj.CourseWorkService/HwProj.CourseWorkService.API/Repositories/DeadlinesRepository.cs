using HwProj.CourseWorkService.API.Models;
using HwProj.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CourseWorkService.API.Repositories
{
    public class DeadlinesRepository : CrudRepository<Deadline>, IDeadlinesRepository
    {
        public DeadlinesRepository(CourseWorkContext context) : base(context)
        {
        }
    }
}
