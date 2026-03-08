using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.Client;
using HwProj.Models.ContentService.DTO;
using HwProj.Models.CourseUnitType;
using HwProj.SolutionsService.Client;

namespace HwProj.APIGateway.API.Filters;

public class FilesPrivacyFilter(
    ICoursesServiceClient coursesServiceClient,
    ISolutionsServiceClient solutionsServiceClient)
{
    private async Task<HashSet<string>> GetSolutionStudentIds(long solutionId)
    {
        var studentIds = new HashSet<string>();
        var solution = await solutionsServiceClient.GetSolutionById(solutionId);
        studentIds.Add(solution.StudentId);

        if (solution.GroupId is { } groupId)
        {
            var groups = await coursesServiceClient.GetGroupsById(groupId);
            if (groups is [var group]) studentIds.UnionWith(group.StudentsIds.ToHashSet());
        }

        return studentIds;
    }

    public async Task<bool> CheckDownloadRights(string? userId, ScopeDTO fileScope)
    {
        if (userId == null) return false;

        switch (fileScope.CourseUnitType)
        {
            case CourseUnitType.Homework:
                return true;
            case CourseUnitType.Solution:
            {
                var studentIds = await GetSolutionStudentIds(fileScope.CourseUnitId);
                if (studentIds.Contains(userId)) return true;

                var mentorIds = await coursesServiceClient.GetCourseLecturersIds(fileScope.CourseId);
                return mentorIds.Contains(userId);
            }
            default:
                return false;
        }
    }

    public async Task<bool> CheckUploadRights(string? userId, ScopeDTO fileScope)
    {
        if (userId == null) return false;

        switch (fileScope.CourseUnitType)
        {
            case CourseUnitType.Homework:
            {
                var mentorIds = await coursesServiceClient.GetCourseLecturersIds(fileScope.CourseId);
                return mentorIds.Contains(userId);
            }
            case CourseUnitType.Solution:
            {
                var studentIds = await GetSolutionStudentIds(fileScope.CourseUnitId);
                return studentIds.Contains(userId);
            }
            default:
                return false;
        }
    }
}
