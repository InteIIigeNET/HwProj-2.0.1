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
    }
}