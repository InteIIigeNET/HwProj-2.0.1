using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;

namespace HwProj.CoursesService.API.Services
{
    public interface IGroupsService
    {
        Task<long> AddAsync(Group group, long courseId);
        Task<Group> GetAsync(long courseId);
        Task<bool> AddCourseMateInGroupAsync(long groupId, string studentId);
    }
}
