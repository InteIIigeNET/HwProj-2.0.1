using HwProj.CoursesService.API.Models;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Repositories
{
    public class DescriptionsRepository : CrudRepository<CourseDescription, long>, IDescriptionsRepository
    {
        public DescriptionsRepository(CourseContext context)
            : base(context)
        {
        }

        public async Task<CourseDescription?> GetDescriptionAsync(long courseId) =>
            await Context.Set<CourseDescription>()
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == courseId);

        public async Task ChangeOrAdd(long courseId, string description)
        {
            var courseDescription = await Context.Set<CourseDescription>().FirstOrDefaultAsync(cd => cd.CourseId == courseId);

            if (courseDescription is null)
            {
                await Context.AddAsync(new CourseDescription
                {
                    CourseId = courseId,
                    Description = description,
                });
            }
            else
            {
                courseDescription.Description = description;
            }

            await Context.SaveChangesAsync();
        }
    }
}
