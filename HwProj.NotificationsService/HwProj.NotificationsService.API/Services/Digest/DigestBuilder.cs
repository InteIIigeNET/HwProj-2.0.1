using System;
using System.Collections.Generic;
using System.Linq;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Services.Messages;

namespace HwProj.NotificationsService.API.Services.Digest
{
    /// <summary>
    /// Собирает дайжест из накопившихся событий получателя. Преподавателю важен масштаб — сколько решений
    /// и заявок пришло по каждой задаче и курсу, поэтому имена показываем только первые несколько.
    /// Студенту важны подробности — оценки, критерии и комментарии преподавателя
    /// </summary>
    public static class DigestBuilder
    {
        private const int MaxEntriesInGroup = 10;
        private const int MaxNamesInHint = 3;

        /// <param name="items">События за сутки в порядке появления</param>
        public static DigestMessage Build(IReadOnlyCollection<DigestItem> items, DateTime until, string siteUrl)
        {
            var digest = new DigestMessage(until);
            var links = new Links(siteUrl);

            var newSolutions = Of(items, DigestItemKind.NewSolution);
            if (newSolutions.Any()) digest.ActionLabel = "Перейти к проверке";

            AddSection(digest, BuildNewSolutions(newSolutions, links));
            AddSection(digest, BuildCourseApplications(Of(items, DigestItemKind.NewCourseMate), links));
            AddSection(digest, BuildRatedSolutions(Of(items, DigestItemKind.SolutionRated), links));

            var newAssignments = Of(items, DigestItemKind.NewHomework, DigestItemKind.NewTask);
            AddSection(digest, BuildNewAssignments(newAssignments, links));
            AddSection(digest, BuildUpdates(Of(items, DigestItemKind.HomeworkUpdated, DigestItemKind.TaskUpdated)
                // Только что опубликованное задание достаточно показать среди новых
                .Where(i => !newAssignments.Any(n => IsSameAssignment(n, i)))
                .ToArray(), links));

            AddSection(digest, BuildCourseEvents(Of(items, DigestItemKind.AcceptedToCourse,
                DigestItemKind.RejectedFromCourse, DigestItemKind.InvitedToCourse, DigestItemKind.BecameLecturer), links));

            return digest;
        }

        private static DigestSection BuildNewSolutions(DigestItem[] items, Links links)
        {
            var section = new DigestSection("Новые решения на проверку",
                ("новое решение", "новых решения", "новых решений")) { ExplicitCount = items.Length };

            foreach (var course in ByCourse(items))
            {
                var entries = course
                    .GroupBy(i => i.TaskId)
                    .OrderByDescending(task => task.Count())
                    .ThenBy(task => task.First().TaskTitle)
                    .Select(task =>
                    {
                        var count = task.Count();
                        return new DigestEntry(task.First().TaskTitle, links.Solutions(task.First()))
                        {
                            Badge = $"{count} {NotificationHtml.Plural(count, "решение", "решения", "решений")}",
                            Hint = Names(task)
                        };
                    });
                section.Groups.Add(Group(course, links, entries, ("задача", "задачи", "задач")));
            }

            return section;
        }

        private static DigestSection BuildCourseApplications(DigestItem[] items, Links links)
        {
            var section = new DigestSection("Заявки на вступление в курсы",
                ("заявка на курс", "заявки на курсы", "заявок на курсы")) { ExplicitCount = items.Length };

            var group = new DigestGroup();
            group.Entries.AddRange(ByCourse(items).Select(course =>
            {
                var count = course.Count();
                return new DigestEntry(course.First().CourseName, links.Applications(course.Key))
                {
                    Badge = $"{count} {NotificationHtml.Plural(count, "заявка", "заявки", "заявок")}",
                    Hint = Names(course)
                };
            }));
            section.Groups.Add(group);

            return section;
        }

        private static DigestSection BuildRatedSolutions(DigestItem[] items, Links links)
        {
            var section = new DigestSection("Проверенные решения",
                ("проверенное решение", "проверенных решения", "проверенных решений"));

            foreach (var course in ByCourse(items))
            {
                // Если за день оценку исправили, актуальна последняя
                var entries = course
                    .GroupBy(i => i.TaskId)
                    .Select(task => task.Last())
                    .Select(item =>
                    {
                        var comment = LecturerComment.Parse(item.Comment);
                        var entry = new DigestEntry(item.TaskTitle, links.Task(item.CourseId, item.TaskId))
                        {
                            Badge = item.MaxRating > 0 ? $"{item.Rating} / {item.MaxRating}" : $"{item.Rating}",
                            BadgeTone = RatingTone(item.Rating ?? 0, item.MaxRating ?? 0),
                            QuoteLabel = "Комментарий преподавателя",
                            Quote = string.IsNullOrWhiteSpace(comment.Text) ? null : comment.Text
                        };
                        entry.Criteria.AddRange(comment.Criteria);
                        return entry;
                    });
                section.Groups.Add(Group(course, links, entries, ("задача", "задачи", "задач")));
            }

            return section;
        }

        private static DigestSection BuildNewAssignments(DigestItem[] items, Links links)
        {
            var section = new DigestSection("Новые задания", ("новое задание", "новых задания", "новых заданий"));

            foreach (var course in ByCourse(items))
            {
                var entries = course.Select(item =>
                {
                    var isHomework = item.Kind == DigestItemKind.NewHomework;
                    var kind = isHomework ? "Домашняя работа" : "Задача";
                    return new DigestEntry(isHomework ? item.HomeworkTitle : item.TaskTitle,
                        isHomework ? links.Homework(item.CourseId, item.HomeworkId) : links.Task(item.CourseId, item.TaskId))
                    {
                        Hint = item.DeadlineDate is { } deadline
                            ? $"{kind} · дедлайн {NotificationHtml.Date(deadline)}"
                            : kind
                    };
                });
                section.Groups.Add(Group(course, links, entries, ("задание", "задания", "заданий")));
            }

            return section;
        }

        private static DigestSection BuildUpdates(DigestItem[] items, Links links)
        {
            var section = new DigestSection("Обновления в заданиях", ("обновление", "обновления", "обновлений"));

            foreach (var course in ByCourse(items))
            {
                var entries = course
                    .GroupBy(i => (i.Kind, i.HomeworkId, i.TaskId))
                    .Select(updates => updates.Last())
                    .Select(item => item.Kind == DigestItemKind.HomeworkUpdated
                        ? new DigestEntry(item.HomeworkTitle, links.Homework(item.CourseId, item.HomeworkId))
                            { Hint = "Домашняя работа обновлена" }
                        : new DigestEntry(item.TaskTitle, links.Task(item.CourseId, item.TaskId))
                            { Hint = "Задача обновлена" });
                section.Groups.Add(Group(course, links, entries, ("обновление", "обновления", "обновлений")));
            }

            return section;
        }

        private static DigestSection BuildCourseEvents(DigestItem[] items, Links links)
        {
            var section = new DigestSection("Ваши курсы", ("изменение в курсах", "изменения в курсах", "изменений в курсах"));

            var group = new DigestGroup();
            group.Entries.AddRange(items.Select(item =>
            {
                switch (item.Kind)
                {
                    case DigestItemKind.AcceptedToCourse:
                        return new DigestEntry(item.CourseName, links.Course(item.CourseId))
                        {
                            Badge = "заявка принята", BadgeTone = DigestTone.Success,
                            Hint = "Теперь вам доступны домашние работы курса и сдача решений"
                        };
                    case DigestItemKind.RejectedFromCourse:
                        return new DigestEntry(item.CourseName, links.Course(item.CourseId))
                        {
                            Badge = "заявка отклонена", BadgeTone = DigestTone.Danger,
                            Hint = "Если это ошибка, свяжитесь с преподавателем курса"
                        };
                    case DigestItemKind.InvitedToCourse:
                        return new DigestEntry(item.CourseName, links.Course(item.CourseId))
                        {
                            Badge = "приглашение",
                            Hint = "Вас пригласили преподавать на этом курсе"
                        };
                    default:
                        return new DigestEntry("Вы стали лектором", links.CreateCourse())
                        {
                            Hint = "Теперь вы можете создавать курсы, публиковать домашние работы и проверять решения"
                        };
                }
            }));
            section.Groups.Add(group);

            return section;
        }

        private static DigestGroup Group(IGrouping<long, DigestItem> course, Links links,
            IEnumerable<DigestEntry> entries, (string One, string Few, string Many) hiddenForms)
        {
            var group = new DigestGroup(course.First().CourseName ?? "Курс", links.Course(course.Key));
            var all = entries.ToArray();

            group.Entries.AddRange(all.Take(MaxEntriesInGroup));
            group.HiddenCount = all.Length - group.Entries.Count;
            if (group.HiddenCount > 0)
                group.HiddenLabel = $"и ещё {group.HiddenCount} " +
                                    NotificationHtml.Plural(group.HiddenCount, hiddenForms.One, hiddenForms.Few, hiddenForms.Many);
            return group;
        }

        private static void AddSection(DigestMessage digest, DigestSection section)
        {
            if (section.Groups.Any(g => g.Entries.Any())) digest.Sections.Add(section);
        }

        private static DigestItem[] Of(IEnumerable<DigestItem> items, params DigestItemKind[] kinds) =>
            items.Where(i => kinds.Contains(i.Kind)).ToArray();

        private static IEnumerable<IGrouping<long, DigestItem>> ByCourse(IEnumerable<DigestItem> items) =>
            items.GroupBy(i => i.CourseId).OrderBy(course => course.First().CourseName);

        private static bool IsSameAssignment(DigestItem newItem, DigestItem update) =>
            newItem.CourseId == update.CourseId &&
            (newItem.Kind == DigestItemKind.NewHomework
                ? update.Kind == DigestItemKind.HomeworkUpdated && newItem.HomeworkId == update.HomeworkId
                : update.Kind == DigestItemKind.TaskUpdated && newItem.TaskId == update.TaskId);

        /// <summary> «Иван Иванов, Пётр Петров, Анна Смирнова и ещё 5» </summary>
        private static string Names(IEnumerable<DigestItem> items)
        {
            var names = items
                .GroupBy(i => i.StudentId)
                .Select(student => student.First().StudentName)
                .Where(name => !string.IsNullOrWhiteSpace(name))
                .ToArray();
            var shown = string.Join(", ", names.Take(MaxNamesInHint));
            return names.Length > MaxNamesInHint ? $"{shown} и ещё {names.Length - MaxNamesInHint}" : shown;
        }

        private static DigestTone RatingTone(int rating, int maxRating)
        {
            if (maxRating <= 0) return DigestTone.Neutral;
            if (rating >= maxRating) return DigestTone.Success;
            return rating > 0 ? DigestTone.Warning : DigestTone.Danger;
        }

        private class Links
        {
            private readonly string _siteUrl;

            public Links(string siteUrl)
            {
                _siteUrl = siteUrl;
            }

            public string Course(long courseId) => $"{_siteUrl}/courses/{courseId}";
            public string Applications(long courseId) => $"{Course(courseId)}/applications";
            public string Homework(long courseId, long? homeworkId) => $"{Course(courseId)}/homeworks?homeworkId={homeworkId}";
            public string Task(long courseId, long? taskId) => $"{Course(courseId)}/homeworks?taskId={taskId}";
            public string CreateCourse() => $"{_siteUrl}/create_course";

            /// <summary> Страница решений задачи открывается на первом студенте — дальше по ней можно листать </summary>
            public string Solutions(DigestItem item) => $"{_siteUrl}/task/{item.TaskId}/{item.StudentId}";
        }
    }
}
