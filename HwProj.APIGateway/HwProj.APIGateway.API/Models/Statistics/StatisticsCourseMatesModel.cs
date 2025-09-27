using System;
using System.Collections.Generic;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.StatisticsService;

namespace HwProj.APIGateway.API.Models.Statistics;

public class StatisticsCourseMatesModel
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Surname { get; set; }
    public AccountDataDto[] Reviewers { get; set; } = Array.Empty<AccountDataDto>();
    public List<StatisticsCourseHomeworksModel> Homeworks { get; set; } = new();
}
