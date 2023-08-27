using System.Collections.Generic;
using System.Linq;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.SolutionsService;
using HwProj.Models.StatisticsService;
using HwProj.SolutionsService.API.Models;

namespace HwProj.SolutionsService.API.Domains
{
    public static class SolutionsStatsDomain
    {
        //TODO: rewrite
        public static StatisticsCourseMatesDto[] GetCourseStatistics(StatisticsAggregateModel model) =>
            model.CourseMates
                .Where(t => t.IsAccepted)
                .Select(m =>
                {
                    var studentGroupIds = model.Groups
                        .Where(g => g.StudentsIds.Contains(m.StudentId))
                        .Select(g => g.Id)
                        .ToArray();

                    return new StatisticsCourseMatesDto
                    {
                        StudentId = m.StudentId,
                        Homeworks = new List<StatisticsCourseHomeworksModel>(model.Homeworks.Select(h =>
                            new StatisticsCourseHomeworksModel
                            {
                                Id = h.Id,
                                Tasks = new List<StatisticsCourseTasksModel>(h.Tasks.Select(t =>
                                {
                                    var solutions =
                                        model.Solutions
                                            .Where(s =>
                                                s.TaskId == t.Id &&
                                                (s.StudentId == m.StudentId ||
                                                 studentGroupIds.Contains(s.GroupId.GetValueOrDefault())
                                                ))
                                            .OrderBy(s => s.PublicationDate);
                                    return new StatisticsCourseTasksModel
                                    {
                                        Id = t.Id,
                                        Solution = solutions.ToList()
                                    };
                                }))
                            }))
                    };
                }).ToArray();

        public static StudentSolutions[] GetCourseTaskStatistics(List<Solution> solutions,
            IEnumerable<GroupViewModel> groups)
        {
            return solutions
                .GroupBy(t => t.GroupId)
                .SelectMany(t => t.Key == null
                    ? t.GroupBy(s => s.StudentId)
                        .Select(studentSolutionsWithoutGroup => new StudentSolutions()
                        {
                            StudentId = studentSolutionsWithoutGroup.Key,
                            Solutions = studentSolutionsWithoutGroup.ToArray()
                        })
                    : groups.FirstOrDefault(x => x.Id == t.Key) is { } group && t.ToArray() is { } groupSolutions
                        ? group.StudentsIds
                            .Select(studentId => new StudentSolutions()
                            {
                                StudentId = studentId,
                                Solutions = groupSolutions
                            })
                        : Enumerable.Empty<StudentSolutions>())
                .GroupBy(s => s.StudentId)
                .Select(g => new StudentSolutions
                {
                    StudentId = g.Key,
                    Solutions = g.SelectMany(s => s.Solutions)
                        .OrderBy(s => s.PublicationDate)
                        .ToArray()
                })
                .ToArray();
        }
    }
}
