using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.HomeworkService.API.Models.Repositories
{
    public class CourseRepository : BaseRepository<Course>, ICourseRepository
    {
        public CourseRepository(HomeworksContext context)
            : base(context)
        {

        }

        protected override IQueryable<Course> GetEntities()
            => GetAllEntites()
                .Include(c => c.Homeworks)
                    .ThenInclude(h => h.Applications);

        public async Task AddHomework(long courseId, Homework homework)
        {
            var course = await GetAsync(c => c.Id == courseId);
            if (course == null)
            {
                course = new Course() { Id = courseId };
                await AddAsync(course);
            }

            course.Homeworks.Add(homework);
            await SaveAsync();
        }
    }
}
