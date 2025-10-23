namespace HwProj.APIGateway.API.Filters;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using CoursesService.Client;
using SolutionsService.Client;
using HwProj.Models.ContentService.DTO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

public class CourseMentorOrSolutionStudentAttribute : ActionFilterAttribute
{
    private readonly ICoursesServiceClient _coursesServiceClient;
    private readonly ISolutionsServiceClient _solutionsServiceClient;

    public CourseMentorOrSolutionStudentAttribute(ICoursesServiceClient coursesServiceClient,  ISolutionsServiceClient solutionsServiceClient)
    {
        _coursesServiceClient = coursesServiceClient;
        _solutionsServiceClient = solutionsServiceClient;
    }

    public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var userId = context.HttpContext.User.Claims
            .FirstOrDefault(claim => claim.Type.ToString() == "_id")?.Value;
        if (userId == null)
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

        if (context.ActionArguments.TryGetValue("processFilesDto", out var processFilesDto) &&
            processFilesDto is ProcessFilesDTO dto)
        {
            courseId = dto.FilesScope.CourseId;
            courseUnitType = dto.FilesScope.CourseUnitType;
            courseUnitId = dto.FilesScope.CourseUnitId;
        }

        if (courseUnitType == "Solution")
        {
            string? studentId = null;
            
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
        } else if (courseUnitType == "Homework")
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