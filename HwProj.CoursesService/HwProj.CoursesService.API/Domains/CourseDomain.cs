using System.Collections.Generic;
using System.Linq;
using HwProj.CoursesService.API.Models;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Domains
{
    public static class CourseViewModelsDomain
    {
        public static AssignmentsViewModel[] GetAssignmentsViewModels(IEnumerable<CourseMateViewModel> courseMates, IEnumerable<Assignment> assignments)
        {
            return courseMates.Where(cm => cm.IsAccepted)
                .GroupBy(cm => assignments.Where(a => a.StudentId == cm.StudentId)?.FirstOrDefault()?.MentorId)
                .Select(g => new AssignmentsViewModel()
                {
                    MentorId = g.Key,
                    StudentIds = g.Select(a => a.StudentId).ToArray()
                }).ToArray();
        }
    }
}