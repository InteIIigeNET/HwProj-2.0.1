using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Models.Repositories
{
    public class UserRepository : BaseRepository<User>, IUserRepository
    {
        public UserRepository(CourseContext context)
            : base(context)
        {
        }

        protected override IQueryable<User> GetEntities()
            => GetAllEntites()
                .Include(u => u.CourseStudents)
                    .ThenInclude(cs => cs.Course);

        public Task<User> GetAsync(string id)
            => GetAsync(u => u.Id == id);
    }
}
