using System.Linq;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Models;
using HwProj.AuthService.Client;
using HwProj.Models.CoursesService.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers;

public class AggregationController : ControllerBase
{
    protected readonly IAuthServiceClient AuthServiceClient;

    protected AggregationController(IAuthServiceClient authServiceClient)
    {
        AuthServiceClient = authServiceClient;
    }

    protected string? UserId =>
        Request.HttpContext.User.Claims
            .FirstOrDefault(claim => claim.Type.ToString() == "_id")
            ?.Value;

    protected async Task<CoursePreviewView[]> GetCoursePreviews(CoursePreview[] courses)
    {
        var mentorIds = courses.SelectMany(t => t.MentorIds).Distinct().ToArray();
        var mentors = await AuthServiceClient.GetAccountsData(mentorIds);
        var mentorsDict = mentors.Where(x => x != null).ToDictionary(x => x.UserId);
        return courses.Select(course => new CoursePreviewView
        {
            Id = course.Id,
            Name = course.Name,
            GroupName = course.GroupName,
            IsCompleted = course.IsCompleted,
            Mentors = course.MentorIds
                .Select(x => mentorsDict.TryGetValue(x, out var mentor) ? mentor : null)
                .Where(x => x != null)
                .ToArray()!,
            TaskId = course.TaskId
        }).ToArray();
    }
}
