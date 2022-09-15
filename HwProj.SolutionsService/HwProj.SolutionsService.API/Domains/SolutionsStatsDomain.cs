using System.Collections.Generic;
using System.Linq;
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
                .Select(m => new StatisticsCourseMatesDto
                {
                    StudentId = m.StudentId,
                    Homeworks = new List<StatisticsCourseHomeworksModel>(model.Homeworks.Select(h =>
                        new StatisticsCourseHomeworksModel
                        {
                            Id = h.Id,
                            Tasks = new List<StatisticsCourseTasksModel>(h.Tasks.Select(t =>
                            {
                                var solutions =
                                    model.Solutions.Where(s => s.TaskId == t.Id && s.StudentId == m.StudentId)
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
                }).ToArray();
    }
}
