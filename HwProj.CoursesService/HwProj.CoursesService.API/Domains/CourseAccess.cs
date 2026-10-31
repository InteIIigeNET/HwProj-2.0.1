namespace HwProj.CoursesService.API.Domains
{
    /// <summary>
    /// Уровень доступа пользователя к курсу
    /// </summary>
    public enum CourseAccess
    {
        /// <summary> Преподаватель или эксперт курса </summary>
        Mentor,

        /// <summary> Принятый на курс студент </summary>
        Student,

        /// <summary> Все остальные, в том числе подавшие заявку на курс </summary>
        Guest
    }
}
