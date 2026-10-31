using Microsoft.AspNetCore.Authorization;

namespace HwProj.CoursesService.API.Authorization
{
    public static class Policies
    {
        /// <summary>
        /// Пользователь — ментор курса, к которому относится запрос
        /// </summary>
        public const string CourseMentor = "CourseMentor";
    }

    public class CourseMentorRequirement : IAuthorizationRequirement
    {
    }
}
