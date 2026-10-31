using System;
using System.Linq;
using System.Linq.Expressions;
using HwProj.CoursesService.API.Models;

namespace HwProj.CoursesService.API.Domains
{
    /// <summary>
    /// Работа со списком менторов курса, который хранится в <see cref="Course.MentorIds"/> одной строкой через '/'
    /// </summary>
    public static class CourseMentors
    {
        private const string Separator = "/";

        public static string[] Parse(string mentorIds) =>
            mentorIds.Split(Separator, StringSplitOptions.RemoveEmptyEntries);

        public static string[] GetMentorIds(this Course course) => Parse(course.MentorIds);

        public static bool HasMentor(this Course course, string userId) => course.GetMentorIds().Contains(userId);

        /// <summary>
        /// Значение <see cref="Course.MentorIds"/> с добавленным ментором
        /// </summary>
        public static string WithMentor(this Course course, string mentorId) =>
            string.IsNullOrEmpty(course.MentorIds) ? mentorId : course.MentorIds + Separator + mentorId;

        /// <summary>
        /// Условие «пользователь — ментор курса», транслируемое в SQL
        /// </summary>
        public static Expression<Func<Course, bool>> IsMentor(string userId)
        {
            var wrappedUserId = Separator + userId + Separator;
            return c => (Separator + c.MentorIds + Separator).Contains(wrappedUserId);
        }
    }
}
