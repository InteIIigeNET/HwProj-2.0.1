using System.Linq;
using HwProj.CoursesService.API.Models;
using HwProj.Models.CoursesService.ViewModels;
using System;

namespace HwProj.CoursesService.API.Domains
{
    public static class MappingExtensions
    {
        public static HomeworkViewModel ToHomeworkViewModel(this Homework homework)
            => new HomeworkViewModel()
            {
                Id = homework.Id,
                Title = homework.Title,
                Description = homework.Description,
                HasDeadline = homework.HasDeadline,
                DeadlineDate = homework.DeadlineDate,
                IsDeadlineStrict = homework.IsDeadlineStrict,
                PublicationDate = homework.PublicationDate,
                CourseId = homework.CourseId,
                IsGroupWork = homework.IsGroupWork,
                IsDeferred = DateTime.UtcNow < homework.PublicationDate,
                Tasks = homework.Tasks.Select(t => t.ToHomeworkTaskViewModel()).ToList(),
            };

        public static HomeworkTaskViewModel ToHomeworkTaskViewModel(this HomeworkTask task)
            => new HomeworkTaskViewModel()
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                MaxRating = task.MaxRating,
                HasDeadline = task.HasDeadline,
                DeadlineDate = task.DeadlineDate,
                IsDeadlineStrict = task.IsDeadlineStrict,
                PublicationDate = task.PublicationDate,
                IsDeferred = DateTime.UtcNow < task.PublicationDate,
                IsGroupWork = task.Homework.IsGroupWork,
                HomeworkId = task.HomeworkId,
            };

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
                IsGroupWork = createHomeworkViewModel.IsGroupWork,
                Tags = createHomeworkViewModel.Tags,
                Tasks = createHomeworkViewModel.Tasks.Select(t => t.ToHomeworkTask()).ToList()
            };
    }
}
