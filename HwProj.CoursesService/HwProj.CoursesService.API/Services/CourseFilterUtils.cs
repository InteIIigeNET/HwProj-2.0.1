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

        public static bool IsFilterParametersEmpty(this CreateCourseFilterViewModel courseFilterViewModel)
        {
            return !courseFilterViewModel.StudentIds.Any()
                   || !courseFilterViewModel.HomeworkIds.Any();
        }
        
        public static CourseDTO CourseDtoApplyFilter(this CourseDTO courseDto, Filter? filter)
        {
            if (filter == null)
            {
                return courseDto;
            }
            
            return new CourseDTO
            {
                Id = courseDto.Id,
                Name = courseDto.Name,
                GroupName = courseDto.GroupName,
                IsCompleted = courseDto.IsCompleted,
                IsOpen = courseDto.IsOpen,
                InviteCode = courseDto.InviteCode,
                Groups = courseDto.Groups,
                MentorIds = !filter.MentorIds.Any()
                    ? courseDto.MentorIds
                    : courseDto.MentorIds.Intersect(filter.MentorIds).ToArray(),
                CourseMates =
                    courseDto.CourseMates.Where(mate => filter.StudentIds.Contains(mate.StudentId)).ToArray(),
                Homeworks =
                    courseDto.Homeworks.Where(hw => filter.HomeworkIds.Contains(hw.Id)).ToArray()
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
