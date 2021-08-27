using System.Collections.Generic;
using System.Linq;
using HwProj.Models.StatisticsService;
using HwProj.SolutionsService.API.Models;

namespace HwProj.SolutionsService.API.Domains
{
    public static class SolutionsStatsDomain
    {
        public static StatisticsCourseMatesModel[] GetCourseStatistics(StatisticsAggregateModel model)
        {
            return model.Course.CourseMates.Select( m => new StatisticsCourseMatesModel()
            {
                Id = m.StudentId,
                Name = model.CourseMatesData.FirstOrDefault(kvp=>kvp.Key.Contains(m.StudentId)).Value.Name,
                Surname = model.CourseMatesData.FirstOrDefault(kvp=>kvp.Key.Contains(m.StudentId)).Value.Surname,
                Homeworks = new List<StatisticsCourseHomeworksModel>(model.Course.Homeworks.Select(h => new StatisticsCourseHomeworksModel()
                {
                    Id = h.Id,
                    Tasks = new List<StatisticsCourseTasksModel>(h.Tasks.Select(t =>
                    {
                        var solution = model.Solutions.FirstOrDefault(s => s.TaskId == t.Id && s.StudentId == m.StudentId);
                        return new StatisticsCourseTasksModel()
                        {
                            Id = t.Id,
                            Solution =
                                solution == null
                                    ? new List<StatisticsCourseSolutionsModel>()
                                    : new List<StatisticsCourseSolutionsModel>()
                                    {
                                        new StatisticsCourseSolutionsModel(solution)
                                    }
                        };
                    }))
                }))
            }).ToArray();
        }
    }
}
