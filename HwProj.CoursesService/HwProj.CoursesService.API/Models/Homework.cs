using System;
using System.Collections.Generic;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Models
{
    public class Homework : IEntity<long>
    {
        public long Id { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }

        public bool HasDeadline { get; set; }

        public DateTime? DeadlineDate { get; set; }

        public bool IsDeadlineStrict { get; set; }

        public DateTime PublicationDate { get; set; }

        public string? Tags { get; set; }

        public long CourseId { get; set; }

        public List<HomeworkTask> Tasks { get; set; }
    }

    public static class HomeworkTags
    {
        public const string Test = "Контрольная работа";
    }
}
