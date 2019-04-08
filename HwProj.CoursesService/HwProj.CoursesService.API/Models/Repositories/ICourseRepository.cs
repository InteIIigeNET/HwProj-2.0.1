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
    }
}
