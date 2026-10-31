using System;

namespace HwProj.CoursesService.API.Repositories
{
    /// <summary>
    /// Ограничения на загружаемые из БД данные курса. Неизменяемый: изменённую копию дают методы With*
    /// </summary>
    public sealed class CourseLoadFilter
    {
        /// <summary> Без ограничений: загружается всё, кроме критериев задач </summary>
        public static readonly CourseLoadFilter Empty = new CourseLoadFilter();

        /// <summary> Загружать только ДЗ и задачи, опубликованные к этому моменту </summary>
        public DateTime? PublishedBefore { get; }

        /// <summary> Загружать только запись этого пользователя среди студентов курса </summary>
        public string? CourseMateId { get; }

        /// <summary> Загружать только группы, в которых состоит этот пользователь </summary>
        public string? GroupMateId { get; }

        public bool IncludeCharacteristics { get; }

        public bool IncludeCriteria { get; }

        public CourseLoadFilter(DateTime? publishedBefore = null, string? courseMateId = null,
            string? groupMateId = null, bool includeCharacteristics = true, bool includeCriteria = false)
        {
            PublishedBefore = publishedBefore;
            CourseMateId = courseMateId;
            GroupMateId = groupMateId;
            IncludeCharacteristics = includeCharacteristics;
            IncludeCriteria = includeCriteria;
        }

        public CourseLoadFilter WithCriteria(bool includeCriteria) =>
            includeCriteria == IncludeCriteria
                ? this
                : new CourseLoadFilter(PublishedBefore, CourseMateId, GroupMateId, IncludeCharacteristics,
                    includeCriteria);

        public CourseLoadFilter WithoutCharacteristics() =>
            !IncludeCharacteristics
                ? this
                : new CourseLoadFilter(PublishedBefore, CourseMateId, GroupMateId, false, IncludeCriteria);
    }
}
