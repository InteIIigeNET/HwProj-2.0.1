using System.Linq;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Models;
using HwProj.AuthService.Client;
using HwProj.Models.CoursesService.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers
{
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
            var getMentorsTasks = courses.Select(t => AuthServiceClient.GetAccountsData(t.MentorIds)).ToList();
            await Task.WhenAll(getMentorsTasks);
            var mentorDTOs = getMentorsTasks.Select(t => t.Result);

            var result = courses.Zip(mentorDTOs, (course, mentors) =>
                new CoursePreviewView
                {
                    Id = course.Id,
                    Name = course.Name,
                    GroupName = course.GroupName,
                    IsCompleted = course.IsCompleted,
                    Mentors = mentors.Where(t => t != null).ToArray()
                }).ToArray();

            return result;
        }
    }
}
