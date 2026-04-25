using System.Collections.Generic;
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
                GroupIds = courseFilterModel.GroupIds,
                HomeworkIds = courseFilterModel.HomeworkIds,
                MentorIds = courseFilterModel.MentorIds,
                StudentIds = courseFilterModel.StudentIds
            }.FillEmptyFields();
        }

        public static Filter FillEmptyFields(this Filter filter)
        {
            filter.GroupIds ??= new List<long>();
            filter.StudentIds ??= new List<string>();
            filter.HomeworkIds ??= new List<long>();
            filter.MentorIds ??= new List<string>();
            return filter;
        }
    }
}
