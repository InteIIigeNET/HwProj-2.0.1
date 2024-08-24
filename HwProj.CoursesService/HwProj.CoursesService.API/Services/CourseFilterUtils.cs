using System.Collections.Generic;
using System.Linq;
using HwProj.CoursesService.API.Models;
using HwProj.Models.CoursesService;

namespace HwProj.CoursesService.API.Services
{
    public static class CourseFilterUtils
    {
        public static Filter CreateFilter(CreateCourseFilterModel courseFilterModel)
        {
            return new Filter
            {
                HomeworkIds = courseFilterModel.HomeworkIds,
                MentorIds = courseFilterModel.MentorIds,
                StudentIds = courseFilterModel.StudentIds
            };
        }

        public static bool IsFilterParametersEmpty(this CreateCourseFilterModel courseFilterModel)
        {
            return !courseFilterModel.StudentIds.Any()
                   || !courseFilterModel.HomeworkIds.Any();
        }

        public static void FillEmptyFields(this Filter filter)
        {
            filter.StudentIds ??= new List<string>();
            filter.HomeworkIds ??= new List<long>();
            filter.MentorIds ??= new List<string>();
        }
    }
}
