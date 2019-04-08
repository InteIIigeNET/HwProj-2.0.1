using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Models.Repositories
{
    public class StudentRepository : CrudRepository<Student>, IUserRepository
    {
        public StudentRepository(CourseContext context)
            : base(context)
        {
        }
    }
}
