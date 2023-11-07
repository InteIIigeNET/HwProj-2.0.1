using System.Linq;
using HwProj.CoursesService.API.Models;
using HwProj.Models;
using HwProj.Models.CoursesService.ViewModels;
using System;

namespace HwProj.CoursesService.API.Domains
{
    public static class MappingExtensions
    {
        public static HomeworkViewModel ToHomeworkViewModel(this Homework homework)
            => new()
            {
                Id = homework.Id,
                Title = homework.Title,
                Description = homework.Description,
                HasDeadline = homework.HasDeadline,
                DeadlineDate = homework.DeadlineDate,
                IsDeadlineStrict = homework.IsDeadlineStrict,
                PublicationDate = homework.PublicationDate,
                CourseId = homework.CourseId,
                IsDeferred = DateTimeUtils.GetMoscowNow() < homework.PublicationDate,
                Tasks = homework.Tasks.Select(t => t.ToHomeworkTaskViewModel()).ToList(),
            };

        public static HomeworkTaskViewModel ToHomeworkTaskViewModel(this HomeworkTask task)
            => new()
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                MaxRating = task.MaxRating,
                HasDeadline = task.HasDeadline,
                DeadlineDate = task.DeadlineDate,
                IsDeadlineStrict = task.IsDeadlineStrict,
                PublicationDate = task.PublicationDate,
                HomeworkId = task.HomeworkId,
                IsDeferred = DateTimeUtils.GetMoscowNow() < task.PublicationDate,
            };

        public static HomeworkTaskForEditingViewModel ToHomeworkTaskForEditingViewModel(this HomeworkTask task)
            => new()
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                MaxRating = task.MaxRating,
                HasDeadline = task.HasDeadline,
                DeadlineDate = task.DeadlineDate,
                IsDeadlineStrict = task.IsDeadlineStrict,
                PublicationDate = task.PublicationDate,
                HomeworkId = task.HomeworkId,
                IsDeferred = DateTimeUtils.GetMoscowNow() < task.PublicationDate,
                Homework = task.Homework.ToHomeworkViewModel(),
            };

        public static CourseMateViewModel ToCourseMateViewModel(this CourseMate courseMate)
            => new()
            {
                StudentId = courseMate.StudentId,
                IsAccepted = courseMate.IsAccepted,
            };

        public static CourseDTO ToCourseDto(this Course course)
            => new()
            {
                Id = course.Id,
                Name = course.Name,
                GroupName = course.GroupName,
                IsCompleted = course.IsCompleted,
                MentorIds = course.MentorIds.Split("/", StringSplitOptions.None),
                IsOpen = course.IsOpen,
                InviteCode = course.InviteCode,
                CourseMates = course.CourseMates.Select(cm => cm.ToCourseMateViewModel()).ToArray(),
                Homeworks = course.Homeworks.Select(h => h.ToHomeworkViewModel()).ToArray(),
            };

        public static CoursePreview ToCoursePreview(this Course course)
            => new()
            {
                Id = course.Id,
                Name = course.Name,
                GroupName = course.GroupName,
                IsCompleted = course.IsCompleted,
                MentorIds = course.MentorIds.Split("/", StringSplitOptions.None),
            };

        public static HomeworkTask ToHomeworkTask(this CreateTaskViewModel createTaskViewModel)
            => new()
            {
                Id = createTaskViewModel.Id,
                Title = createTaskViewModel.Title,
                Description = createTaskViewModel.Description,
                MaxRating = createTaskViewModel.MaxRating,
                HasDeadline = createTaskViewModel.HasDeadline,
                DeadlineDate = createTaskViewModel.DeadlineDate,
                IsDeadlineStrict = createTaskViewModel.IsDeadlineStrict,
                PublicationDate = createTaskViewModel.PublicationDate,
                HomeworkId = createTaskViewModel.HomeworkId,
            };

        public static Homework ToHomework(this CreateHomeworkViewModel createHomeworkViewModel)
            => new()
            {
                Id = createHomeworkViewModel.Id,
                Title = createHomeworkViewModel.Title,
                Description = createHomeworkViewModel.Description,
                HasDeadline = createHomeworkViewModel.HasDeadline,
                DeadlineDate = createHomeworkViewModel.DeadlineDate,
                IsDeadlineStrict = createHomeworkViewModel.IsDeadlineStrict,
                Tasks = createHomeworkViewModel.Tasks.Select(t => t.ToHomeworkTask()).ToList()
            };
    }
}