using HwProj.CoursesService.API.Models;

namespace HwProj.CoursesService.API.Domains
{
    public static class CourseDomain
    {
        public static void FillTasksInCourses(params Course[] courses)
        {
            foreach (var course in courses)
            {
                foreach (var homework in course.Homeworks)
                {
                    FillTasksInHomework(homework);
                }
            }
        }

        public static Homework FillTasksInHomework(Homework homework)
        {
            foreach (var task in homework.Tasks)
            {
                FillTask(homework, task);
            }

            return homework;
        }

        public static HomeworkTask FillTask(Homework homework, HomeworkTask task)
        {
            var hasDeadline = task.HasDeadline ?? homework.HasDeadline;
            task.HasDeadline = hasDeadline;
            task.IsDeadlineStrict ??= homework.IsDeadlineStrict;
            task.DeadlineDate ??= hasDeadline ? homework.DeadlineDate : null;
            task.PublicationDate ??= homework.PublicationDate;

            return task;
        }
    }
}
