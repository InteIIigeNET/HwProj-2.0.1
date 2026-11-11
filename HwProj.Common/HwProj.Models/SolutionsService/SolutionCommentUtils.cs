using System.Collections.Generic;

namespace HwProj.Models.SolutionsService
{
    public static class SolutionCommentUtils
    {
        public static string WithoutCriterionScores(string comment)
        {
            if (string.IsNullOrEmpty(comment)) return comment;
            var lines = comment.Split('\n');
            var result = new List<string>();
            for (var i = 0; i < lines.Length; i++)
            {
                if (lines[i].Trim() != "| Критерий оценивания | Баллы |") result.Add(lines[i]);
                else while (i + 1 < lines.Length && lines[i + 1].Trim().StartsWith("|") &&
                            lines[i + 1].Trim().EndsWith("|")) i++;
            }
            return string.Join("\n", result).Trim();
        }
    }
}
