using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models.ViewModels;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Models.Repositories
{
    public class CourseRepository : CrudRepository<Course>, ICourseRepository
    {
        public CourseRepository(CourseContext context)
            : base(context)
        {
        }
    }
}
