using System.Collections.Generic;
using System.Linq;
using HwProj.Models.SolutionsService;
using HwProj.Models.StatisticsService;
using HwProj.SolutionsService.API.Models;

namespace HwProj.SolutionsService.API.Domains
{
    public static class SolutionsStatsDomain
    {
        // public static StatisticsCourseMatesDto[] GetCourseStatistics(StatisticsAggregateModel model)
        // {
        //     var accepted = model.CourseMates
        // }

        //TODO: rewrite
        public static StatisticsCourseMatesDto[] GetCourseStatistics(StatisticsAggregateModel model) =>
            model.CourseMates
                .Where(t => t.IsAccepted)
                .Select(m =>
                {
                    var studentGroupIds = model.Groups
                        .Where(g => g.StudentsIds.Contains(m.StudentId))
                        .Select(g => g.Id).ToList();
                    
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

        public static StudentSolutions[] GetCourseTaskStatistics(IEnumerable<Solution> solutions)
        {
            return solutions
                .GroupBy(t => t.StudentId)
                .Select(t => new StudentSolutions()
                {
                    StudentId = t.Key,
                    Solutions = t.OrderBy(s => s.PublicationDate).ToArray()
                })
                .ToArray();
        }
    }
}
