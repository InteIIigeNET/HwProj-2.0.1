using System.Collections.Generic;
using System.Linq;
using HwProj.Models.StatisticsService;
using HwProj.SolutionsService.API.Models;

namespace HwProj.SolutionsService.API.Domains
{
    public static class SolutionsStatsDomain
    {
        //TODO: rewrite
        public static StatisticsCourseMatesModel[] GetCourseStatistics(StatisticsAggregateModel model) =>
            model.Course.CourseMates
                .Where(t => t.IsAccepted)
                .Select(m => new StatisticsCourseMatesModel
                {
                    Id = m.StudentId,
                    Name = model.CourseMatesData.FirstOrDefault(kvp => kvp.Key.Contains(m.StudentId)).Value.Name,
                    Surname = model.CourseMatesData.FirstOrDefault(kvp => kvp.Key.Contains(m.StudentId)).Value.Surname,
                    Homeworks = new List<StatisticsCourseHomeworksModel>(model.Course.Homeworks.Select(h =>
                        new StatisticsCourseHomeworksModel
                        {
                            Id = h.Id,
                            Tasks = new List<StatisticsCourseTasksModel>(h.Tasks.Select(t =>
                            {
                                var solutions =
                                    model.Solutions.Where(s => s.TaskId == t.Id && s.StudentId == m.StudentId);
                                var solutionsInRightModel =
                                    new List<StatisticsCourseSolutionsModel>(solutions.Select(s =>
                                        new StatisticsCourseSolutionsModel(s)));
                                return new StatisticsCourseTasksModel()
                                {
                                    Id = t.Id,
                                    Solution = solutionsInRightModel
                                };
                            }))
                        }))
                }).ToArray();
    }
}
