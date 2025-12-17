using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.Client;
using HwProj.Models.ContentService.DTO;
using HwProj.Models.CourseUnitType;
using HwProj.SolutionsService.Client;

namespace HwProj.APIGateway.API.Filters;

public class FilesPrivacyFilter
{
    private readonly ICoursesServiceClient _coursesServiceClient;
    private readonly ISolutionsServiceClient _solutionsServiceClient;

    public FilesPrivacyFilter(ICoursesServiceClient coursesServiceClient, ISolutionsServiceClient solutionsServiceClient)
    {
        _coursesServiceClient = coursesServiceClient;
        _solutionsServiceClient = solutionsServiceClient;
    }

    public async Task<bool> CheckDownloadRights(string? userId, ScopeDTO fileScope)
    {
        if (fileScope.CourseUnitType == CourseUnitType.Homework) return true;
        if (fileScope.CourseUnitType == CourseUnitType.Solution)
        {
            if (userId == null) return false;
            var studentIds = new HashSet<string>();
            var solution = await _solutionsServiceClient.GetSolutionById(fileScope.CourseUnitId);
            studentIds.Add(solution.StudentId);
            var groupIds = await _coursesServiceClient.GetGroupsById(solution.GroupId ?? 0);
            studentIds.UnionWith(groupIds.FirstOrDefault()?.StudentsIds.ToHashSet() ?? new());

            var mentorIds = await _coursesServiceClient.GetCourseLecturersIds(fileScope.CourseId);

            if (!studentIds.Contains(userId) && !mentorIds.Contains(userId)) return false;

            return true;
        }

        return false;
    }

    public async Task<bool> CheckUploadRights(string? userId, ScopeDTO fileScope)
    {
        if (userId == null) return false;
        if (fileScope.CourseUnitType == CourseUnitType.Homework)
        {
            var mentorIds = await _coursesServiceClient.GetCourseLecturersIds(fileScope.CourseId);
            if (!mentorIds.Contains(userId)) return false;
            return true;
        }
        if (fileScope.CourseUnitType == CourseUnitType.Solution)
        {
            var studentIds = new HashSet<string>();
            var solution = await _solutionsServiceClient.GetSolutionById(fileScope.CourseUnitId);
            studentIds.Add(solution.StudentId);
            var group = await _coursesServiceClient.GetGroupsById(solution.GroupId ?? 0);
            studentIds.UnionWith(group.FirstOrDefault()?.StudentsIds.ToHashSet() ?? new());

            if (!studentIds.Contains(userId)) return false;

            return true;
        }

        return false;
    }
}
