using System.Collections.Generic;
using System.Linq;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.SolutionsService;

namespace HwProj.APIGateway.API.Services;

/// <summary>Применяется только к ответам Gateway: внутренние сервисы сохраняют точные баллы.</summary>
public static class GradeVisibility
{
    public static HashSet<long> HiddenTaskIds(CourseDTO course, string? viewerId) =>
        course.MentorIds.Contains(viewerId)
            ? new HashSet<long>()
            : course.Homeworks.Where(h => h.HideRatings).SelectMany(h => h.Tasks).Select(t => t.Id).ToHashSet();

    public static void Apply(SolutionDto solution, ISet<long> hiddenTaskIds)
    {
        if (!hiddenTaskIds.Contains(solution.TaskId)) return;
        solution.Rating = null;
        solution.IsRatingHidden = true;
        // Final автоматически выдаётся при максимальном балле и мог бы раскрыть его.
        if (solution.State == SolutionState.Final) solution.State = SolutionState.Rated;
        solution.LecturerComment = RemoveCriteriaScores(solution.LecturerComment);
    }

    public static void Apply(IEnumerable<StudentSolutionsTableDto> statistics, ISet<long> hiddenTaskIds)
    {
        foreach (var student in statistics)
        foreach (var homework in student.Homeworks)
        foreach (var task in homework.Tasks)
        foreach (var solution in task.Solutions)
            Apply(solution, hiddenTaskIds);
    }

    public static string RemoveCriteriaScores(string comment)
    {
        if (string.IsNullOrEmpty(comment)) return comment;
        return SolutionCommentUtils.WithoutCriterionScores(comment);
    }
}
