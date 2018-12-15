using HwProj.CoursesService.API.Models.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.HomeworkService.API.Models.Repositories
{
    public interface ICourseRepository : ICrudRepository<Course>
    {
        Task<bool> AddHomework(long courseId, Homework homework);
    }
}
