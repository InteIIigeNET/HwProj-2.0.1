using System;
using System.Collections.Generic;
using System.Linq;
using HwProj.CoursesService.API.Repositories;
using HwProj.Models.CoursesService;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Domains
{
    /// <summary>
    /// Правила видимости данных курса в зависимости от уровня доступа пользователя
    /// </summary>
    public static class CourseVisibility
    {
        public static CourseAccess GetAccess(string userId, IEnumerable<string> mentorIds, bool isAcceptedStudent)
        {
            if (mentorIds.Contains(userId))
                return CourseAccess.Mentor;

            return isAcceptedStudent ? CourseAccess.Student : CourseAccess.Guest;
        }

        /// <summary>
        /// Какую часть курса имеет смысл загружать из БД: всё, что отсекается здесь,
        /// всё равно было бы скрыто в <see cref="HideInaccessibleData"/>
        /// </summary>
        public static CourseLoadFilter GetLoadFilter(CourseAccess access, string userId, DateTime now)
        {
            if (access == CourseAccess.Mentor) return CourseLoadFilter.Empty;

            return new CourseLoadFilter(
                publishedBefore: now,
                courseMateId: access == CourseAccess.Guest ? userId : null,
                groupMateId: userId,
                includeCharacteristics: false);
        }

        /// <summary>
        /// Скрывает в переданном курсе данные, недоступные пользователю
        /// </summary>
        public static CourseDTO HideInaccessibleData(CourseDTO course, string userId, CourseAccess access,
            DateTime now)
        {
            if (access == CourseAccess.Mentor) return course;

            var isCourseStudent = access == CourseAccess.Student;

            course.CourseMates = isCourseStudent
                ? course.CourseMates
                : course.CourseMates.Where(t => t.StudentId == userId).ToArray();

            foreach (var courseMate in course.CourseMates)
            {
                courseMate.Characteristics = null;
            }

            course.Homeworks = course.Homeworks
                .Where(h =>
                    now >= h.PublicationDate &&
                    (isCourseStudent || !h.Tags.Contains(HomeworkTags.Test)))
                .ToArray();

            foreach (var homework in course.Homeworks)
            {
                homework.Tasks = new List<HomeworkTaskViewModel>(homework.Tasks.Where(t => now >= t.PublicationDate));
            }

            course.Groups = course.Groups.Where(g => g.StudentsIds.Contains(userId)).ToArray();
            return course;
        }
    }
}
