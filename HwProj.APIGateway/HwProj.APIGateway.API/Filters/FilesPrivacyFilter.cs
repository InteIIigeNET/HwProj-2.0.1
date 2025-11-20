using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using HwProj.CoursesService.Client;
using HwProj.Models.ContentService.DTO;
using HwProj.Models.Roles;
using HwProj.SolutionsService.Client;

namespace HwProj.APIGateway.API.Filters;

public class FilesPrivacyFilter
{
    public enum Method
    {
        Upload,
        Download
    }
    
    private readonly ICoursesServiceClient _coursesServiceClient;
    private readonly ISolutionsServiceClient _solutionsServiceClient;

    public FilesPrivacyFilter(ICoursesServiceClient coursesServiceClient, ISolutionsServiceClient solutionsServiceClient)
    {
        _coursesServiceClient = coursesServiceClient;
        _solutionsServiceClient = solutionsServiceClient;
    }

    public async Task<bool> CheckRights(ClaimsPrincipal user, ScopeDTO fileScope, Method method)
    {
        var userId = user.Claims
            .FirstOrDefault(claim => claim.Type.ToString() == "_id")?.Value;
        if (userId == null) return false;
        
        var userRole = user.Claims
            .FirstOrDefault(claim => claim.Type.ToString().EndsWith("role"))?.Value;
        if (userRole == null) return false;
    
        if (fileScope.CourseUnitType == "Homework")
        {
            if (method == Method.Download) return true; 
            if (method == Method.Upload)
            {
                var mentorIds = await _coursesServiceClient.GetCourseLecturersIds(fileScope.CourseId);
                if (!mentorIds.Contains(userId))
                {
                    return false;
                }
                return true;
            }
        } else if (fileScope.CourseUnitType == "Solution")
        {

            if (userRole == Roles.StudentRole)
            {
                var studentIds = new HashSet<string>();
                var solution = await _solutionsServiceClient.GetSolutionById(fileScope.CourseUnitId);
                studentIds.Add(solution.StudentId);
                var group = await _coursesServiceClient.GetGroupsById(solution.GroupId ?? 0);
                studentIds.UnionWith(group.FirstOrDefault()?.StudentsIds.ToHashSet() ?? new());

                if (!studentIds.Contains(userId)) return false;
            }
            else
            {
                var mentorIds = await _coursesServiceClient.GetCourseLecturersIds(fileScope.CourseId);
                if (!mentorIds.Contains(userId)) return false;
            }

            return true;
        }

        return false;
    }
}
