using HwProj.CoursesService.API.Models.ViewModels;
using HwProj.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Models.Repositories
{
    public interface ICourseRepository : ICrudRepository<Course>
    {
        Task<Course> GetWithCourseMatesAsync(long id);
        Task<List<Course>> GetAllWithCourseMatesAsync();
    }
}
