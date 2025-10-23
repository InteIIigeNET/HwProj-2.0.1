using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.Client;
using HwProj.SolutionsService.Client;
using HwProj.Models.ContentService.DTO;
using HwProj.Models.Roles;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace HwProj.APIGateway.API.Filters;

public class SolutionPrivacyAttribute : ActionFilterAttribute
{
    private readonly ICoursesServiceClient _coursesServiceClient;
    private readonly ISolutionsServiceClient _solutionsServiceClient;

    public SolutionPrivacyAttribute(ICoursesServiceClient coursesServiceClient, ISolutionsServiceClient solutionsServiceClient)
    {
        _coursesServiceClient = coursesServiceClient;
        _solutionsServiceClient = solutionsServiceClient;
    }

    public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var userId = context.HttpContext.User.Claims
            .FirstOrDefault(claim => claim.Type.ToString() == "_id")?.Value;
        var userRole = context.HttpContext.User.Claims
            .FirstOrDefault(claim => claim.Type.ToString().EndsWith("role"))?.Value;
        
        if (userId == null || userRole == null)
        {
            context.Result = new ContentResult
            {
                StatusCode = StatusCodes.Status403Forbidden,
                Content = "В запросе не передан идентификатор пользователя",
                ContentType = "application/json"
            };
            return;
        }

        
        long courseId = -1;
        var courseUnitType = "";
        long courseUnitId = -1;

        // Для метода GetStatuses (параметр: filesScope)
        if (context.ActionArguments.TryGetValue("filesScope", out var filesScope) &&
                 filesScope is ScopeDTO scopeDto)
        {
            courseId = scopeDto.CourseId;
            courseUnitType = scopeDto.CourseUnitType;
            courseUnitId = scopeDto.CourseUnitId;
        }
        // Для метода GetDownloadLink (параметр: fileScope)
        else if (context.ActionArguments.TryGetValue("fileScope", out var fileScope) &&
            fileScope is FileScopeDTO fileScopeDto)
        {
            courseId = fileScopeDto.CourseId;
            courseUnitType = fileScopeDto.CourseUnitType;
            courseUnitId = fileScopeDto.CourseUnitId;
        }

        if (courseUnitType == "Homework") next.Invoke();
        
        if (userRole == Roles.StudentRole)
        {
            HashSet<string> studentIds = [];
            if (courseId != -1)
            {
                var solution = await _solutionsServiceClient.GetSolutionById(courseUnitId);
                studentIds.Add(solution.StudentId);
                var group = await _coursesServiceClient.GetGroupsById(solution.GroupId ?? 0);
                studentIds.UnionWith(group.FirstOrDefault()?.StudentsIds.ToHashSet() ?? new());
            }

            if (!studentIds.Contains(userId))
            {
                context.Result = new ContentResult
                {
                    StatusCode = StatusCodes.Status403Forbidden,
                    Content = "Недостаточно прав для работы с файлами: Вы не являетесь студентом, отправляющим задание",
                    ContentType = "application/json"
                };
                return;
            }
        } else if (userRole == Roles.LecturerRole)
        {
            string[]? mentorIds = null;
            
            if (courseId != -1)
                mentorIds = await _coursesServiceClient.GetCourseLecturersIds(courseId);
            if (mentorIds == null || !mentorIds.Contains(userId))
            {
                context.Result = new ContentResult
                {
                    StatusCode = StatusCodes.Status403Forbidden,
                    Content = "Недостаточно прав для работы с файлами: Вы не являетесь ментором на курсе",
                    ContentType = "application/json"
                };
                return;
            }
        }

        await next.Invoke();
    }

    private static string? GetValueFromRequest(HttpRequest request, string key)
    {
        if (request.Query.TryGetValue(key, out var queryValue))
            return queryValue.ToString();

        if (request.HasFormContentType && request.Form.TryGetValue(key, out var formValue))
            return formValue.ToString();

        return null;
    }
}
