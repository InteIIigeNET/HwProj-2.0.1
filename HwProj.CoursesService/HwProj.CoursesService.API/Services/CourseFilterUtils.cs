using System.Collections.Generic;
using System.Linq;
using HwProj.CoursesService.API.Models;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Services
{
    public static class CourseFilterUtils
    {
        public static Filter CreateFilter(CreateCourseFilterViewModel courseFilterViewModel)
        {
            return new Filter
            {
                HomeworkIds = courseFilterViewModel.HomeworkIds,
                MentorIds = courseFilterViewModel.MentorIds,
                StudentIds = courseFilterViewModel.StudentIds
            };
        }
        
        public static CourseDTO CourseDtoApplyFilter(CourseDTO courseDto, Filter? filter)
        {
            if (filter == null)
            {
                return courseDto;
            }
            
            var mentorIds = filter.MentorIds.Any() ? courseDto.MentorIds 
                : courseDto.MentorIds.Intersect(filter.MentorIds).ToArray();
            var courseMates = filter.StudentIds.Any() ? courseDto.CourseMates 
                : courseDto.CourseMates.Where(mate => filter.StudentIds.Contains(mate.StudentId)).ToArray();
            var homeworks = filter.HomeworkIds.Any() ? courseDto.Homeworks 
                : courseDto.Homeworks.Where(hw => filter.HomeworkIds.Contains(hw.Id)).ToArray();
            var groups = filter.StudentIds.Any() ? courseDto.Groups
                : courseDto.Groups.Where(g => g.StudentsIds.Union(filter.StudentIds).Any()).ToArray();
            
            return new CourseDTO
            {
                Id = courseDto.Id,
                Name = courseDto.Name,
                GroupName = courseDto.GroupName,
                IsOpen = courseDto.IsOpen,
                InviteCode = courseDto.InviteCode,
                IsCompleted = courseDto.IsCompleted,
                MentorIds = mentorIds,
                CourseMates = courseMates,
                Homeworks = homeworks,
                Groups = groups
            };
        }

        public static void FillEmptyFields(this Filter filter)
        {
            filter.StudentIds ??= new List<string>();
            filter.HomeworkIds ??= new List<long>();
            filter.MentorIds ??= new List<string>();
        }
    }
}
