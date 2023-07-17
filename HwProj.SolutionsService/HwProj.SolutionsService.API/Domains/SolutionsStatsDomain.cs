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
                        .Select(g => g.Id);
                    
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
                                        model.Solutions.Where(s => s.TaskId == t.Id
                                                                   && (s.StudentId == m.StudentId 
                                                                       || studentGroupIds.Contains(s.GroupId.GetValueOrDefault())
                                                                       ))
                                            .OrderBy(s => s.PublicationDate);
                                    var solutionsInRightModel =
                                        new List<StatisticsCourseSolutionsModel>(solutions.Select(s =>
                                            new StatisticsCourseSolutionsModel(s)));
                                    return new StatisticsCourseTasksModel
                                    {
                                        Id = t.Id,
                                        Solution = solutionsInRightModel
                                    };
                                }))
                            }))
                    };
                }).ToArray();

        public static StudentSolutions[] GetCourseTaskStatistics(IEnumerable<Solution> solutions, IEnumerable<GroupViewModel> groups)
        {
            var sortedSolutions = solutions.OrderBy(s => s.PublicationDate);
            return groups.SelectMany(g => g.StudentsIds, (g, studentId) => new { g.Id, studentId })
                .Select(p => new StudentSolutions
                {
                    StudentId = p.studentId,
                    Solutions = sortedSolutions.Where(s => s.StudentId == p.studentId || s.GroupId == p.Id)
                        .ToArray()
                })
                .Concat(
                    sortedSolutions.Where(s => s.GroupId == null)
                        .GroupBy(s => s.StudentId)
                        .Select(g => new StudentSolutions
                        {
                            StudentId = g.Key,
                            Solutions = g.ToArray()
                        })
                ).GroupBy(t => t.StudentId)
                .Select(g => g.First())
                .ToArray();
        }
    }
}
