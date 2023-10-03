using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;

namespace HwProj.CoursesService.API.Domains
{
    public static class CourseDomain
    {
        // TODO: Try with null
        public static void FillTasksInCourses(IEnumerable<Course> courses)
        {
            foreach (var course in courses)
            {
                foreach (var homework in course.Homeworks)
                {
                    FillAllTasksInHomework(homework);
                }
            }
        }

        public static void FillAllTasksInHomework(Homework homework)
        {
            foreach (var task in homework.Tasks.Where(task => task.PublicationDate == null))
            {
                FillSpecificTaskInHomework(task, homework);
            }
        }

        public static void FillSpecificTaskInHomework(HomeworkTask task, Homework homework)
        {
            task.HasDeadline = homework.HasDeadline;
            task.DeadlineDate = homework.DeadlineDate;
            task.PublicationDate = homework.PublicationDate;
            task.IsDeadlineStrict = homework.IsDeadlineStrict;
        }
    }
}