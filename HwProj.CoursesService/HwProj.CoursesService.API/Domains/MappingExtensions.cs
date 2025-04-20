using System.Linq;
using HwProj.CoursesService.API.Models;
using HwProj.Models.CoursesService.ViewModels;
using System;
using HwProj.Models.CoursesService;
using HwProj.Models.CoursesService.DTO;
using Microsoft.EntityFrameworkCore.Internal;

namespace HwProj.CoursesService.API.Domains
{
    public static class MappingExtensions
    {
        private static readonly DateTime DateToOverride = DateTime.MaxValue;

        public static HomeworkViewModel ToHomeworkViewModel(this Homework homework)
        {
            var tags = homework.Tags?.Split(';') ?? Array.Empty<string>();
            return new HomeworkViewModel()
            {
                Id = homework.Id,
                Title = homework.Title,
                Description = homework.Description,
                HasDeadline = homework.HasDeadline,
                DeadlineDate = homework.DeadlineDate,
                IsDeadlineStrict = homework.IsDeadlineStrict,
                PublicationDate = homework.PublicationDate,
                PublicationDateNotSet = homework.PublicationDate == DateToOverride,
                DeadlineDateNotSet = homework.DeadlineDate == null || homework.DeadlineDate == DateToOverride,
                CourseId = homework.CourseId,
                IsGroupWork = tags.Contains(HomeworkTags.GroupWork),
                IsDeferred = DateTime.UtcNow < homework.PublicationDate,
                Tasks = homework.Tasks.Select(t => t.ToHomeworkTaskViewModel()).ToList(),
                Tags = tags.ToList(),
            };
        }

        public static HomeworkTaskViewModel ToHomeworkTaskViewModel(this HomeworkTask task)
        {
            var tags = task.Homework.Tags?.Split(';') ?? Array.Empty<string>();
            var evaluatedPublicationDate = task.PublicationDate ?? task.Homework.PublicationDate;
            return new HomeworkTaskViewModel()
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                MaxRating = task.MaxRating,
                HasDeadline = task.HasDeadline,
                DeadlineDate = task.DeadlineDate,
                IsDeadlineStrict = task.IsDeadlineStrict,
                PublicationDate = task.PublicationDate,
                PublicationDateNotSet = task.PublicationDate == null || task.PublicationDate == DateToOverride,
                DeadlineDateNotSet = task.DeadlineDate == null || task.DeadlineDate == DateToOverride,
                IsDeferred = DateTime.UtcNow < evaluatedPublicationDate,
                IsGroupWork = tags.Contains(HomeworkTags.GroupWork),
                HomeworkId = task.HomeworkId,
                Tags = tags,
            };
        }

        public static HomeworkTaskForEditingViewModel ToHomeworkTaskForEditingViewModel(this HomeworkTask task)
            => new HomeworkTaskForEditingViewModel()
            {
                Task = task.ToHomeworkTaskViewModel(),
                Homework = task.Homework.ToHomeworkViewModel(),
            };

        public static CourseMateViewModel ToCourseMateViewModel(this CourseMate courseMate)
            => new CourseMateViewModel()
            {
                StudentId = courseMate.StudentId,
                IsAccepted = courseMate.IsAccepted,
                Characteristics = courseMate.Characteristics is { } characteristics
                    ? new StudentCharacteristicsDto()
                    {
                        Description = characteristics.Description,
                        Tags = characteristics.Tags.Split(";", StringSplitOptions.RemoveEmptyEntries),
                    }
                    : null
            };

        public static CourseDTO ToCourseDto(this Course course)
            => new CourseDTO()
            {
                Id = course.Id,
                Name = course.Name,
                GroupName = course.GroupName,
                IsCompleted = course.IsCompleted,
                MentorIds = course.MentorIds.Split("/"),
                IsOpen = course.IsOpen,
                InviteCode = course.InviteCode,
                CourseMates = course.CourseMates.Select(cm => cm.ToCourseMateViewModel()).ToArray(),
                Homeworks = course.Homeworks.Select(h => h.ToHomeworkViewModel()).ToArray(),
            };

        public static CoursePreview ToCoursePreview(this Course course)
            => new CoursePreview()
            {
                Id = course.Id,
                Name = course.Name,
                GroupName = course.GroupName,
                IsCompleted = course.IsCompleted,
                MentorIds = course.MentorIds.Split("/"),
            };

        public static HomeworkTask ToHomeworkTask(this CreateTaskViewModel createTaskViewModel)
            => new HomeworkTask()
            {
                Title = createTaskViewModel.Title,
                Description = createTaskViewModel.Description,
                MaxRating = createTaskViewModel.MaxRating,
                HasDeadline = createTaskViewModel.HasDeadline,
                DeadlineDate = createTaskViewModel.DeadlineDate,
                IsDeadlineStrict = createTaskViewModel.IsDeadlineStrict,
                PublicationDate = createTaskViewModel.PublicationDate,
            };

        public static Homework ToHomework(this CreateHomeworkViewModel createHomeworkViewModel)
            => new Homework()
            {
                Title = createHomeworkViewModel.Title,
                Description = createHomeworkViewModel.Description,
                HasDeadline = createHomeworkViewModel.HasDeadline,
                DeadlineDate = createHomeworkViewModel.DeadlineDate,
                IsDeadlineStrict = createHomeworkViewModel.IsDeadlineStrict,
                PublicationDate = createHomeworkViewModel.PublicationDate,
                Tasks = createHomeworkViewModel.Tasks.Select(t => t.ToHomeworkTask()).ToList(),
                Tags = createHomeworkViewModel.Tags.Join(";"),
            };

        public static CourseTemplate ToCourseTemplate(this CreateCourseViewModel createCourseViewModel)
            => new CourseTemplate()
            {
                Name = createCourseViewModel.Name,
                GroupName = createCourseViewModel.GroupName,
                IsOpen = createCourseViewModel.IsOpen,
            };

        public static CourseTemplate ToCourseTemplate(this CourseDTO course)
            => new CourseTemplate()
            {
                Name = course.Name,
                GroupName = course.GroupName,
                IsOpen = course.IsOpen,
                Homeworks = course.Homeworks.Select(h => h.ToHomeworkTemplate()).ToList(),
            };

        public static HomeworkTemplate ToHomeworkTemplate(this HomeworkViewModel homework)
            => new HomeworkTemplate()
            {
                Title = homework.Title,
                Description = homework.Description,
                HasDeadline = homework.HasDeadline,
                IsDeadlineStrict = homework.IsDeadlineStrict,
                Tags = homework.Tags.Join(";"),
                Tasks = homework.Tasks.Select(t => t.ToHomeworkTaskTemplate()).ToList(),
            };

        public static HomeworkTaskTemplate ToHomeworkTaskTemplate(this HomeworkTaskViewModel task)
            => new HomeworkTaskTemplate()
            {
                Title = task.Title,
                Description = task.Description,
                MaxRating = task.MaxRating,
                HasDeadline = task.HasDeadline,
                IsDeadlineStrict = task.IsDeadlineStrict,
                HasSpecialPublicationDate = task.PublicationDate != null,
                HasSpecialDeadlineDate = task.DeadlineDate != null,
            };

        public static Course ToCourse(this CourseTemplate courseTemplate)
            => new Course()
            {
                Name = courseTemplate.Name,
                GroupName = courseTemplate.GroupName,
                IsOpen = courseTemplate.IsOpen,
            };

        public static Homework ToHomework(this HomeworkTemplate homeworkTemplate, long courseId)
            => new Homework()
            {
                Title = homeworkTemplate.Title,
                Description = homeworkTemplate.Description,
                HasDeadline = homeworkTemplate.HasDeadline,
                IsDeadlineStrict = homeworkTemplate.IsDeadlineStrict,
                Tags = homeworkTemplate.Tags,
                CourseId = courseId,
                PublicationDate = DateToOverride,
            };

        public static HomeworkTask ToHomeworkTask(this HomeworkTaskTemplate taskTemplate, long homeworkId)
            => new HomeworkTask()
            {
                Title = taskTemplate.Title,
                Description = taskTemplate.Description,
                MaxRating = taskTemplate.MaxRating,
                HasDeadline = taskTemplate.HasDeadline,
                IsDeadlineStrict = taskTemplate.IsDeadlineStrict,
                HomeworkId = homeworkId,
                PublicationDate = taskTemplate.HasSpecialPublicationDate ? DateToOverride : (DateTime?)null,
                DeadlineDate = taskTemplate.HasSpecialDeadlineDate ? DateToOverride : (DateTime?)null,
            };
    }
}
