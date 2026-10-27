using System;
using System.Collections.Generic;
using System.Linq;

namespace HwProj.NotificationsService.API.Services.Messages
{
    /// <summary>
    /// Комментарий преподавателя к оценке. Если решение оценивалось по критериям, фронтенд дописывает
    /// в комментарий markdown-таблицу «| Критерий оценивания | Баллы |» — в уведомлении её показываем
    /// отдельным списком, а не сырым markdown
    /// </summary>
    public class LecturerComment
    {
        private const string CriteriaTableHeader = "| Критерий оценивания | Баллы |";

        public string Text { get; private set; } = "";
        public List<(string Label, string Value)> Criteria { get; } = new List<(string Label, string Value)>();

        public static LecturerComment Parse(string comment)
        {
            var result = new LecturerComment();
            if (string.IsNullOrWhiteSpace(comment)) return result;

            var lines = comment.Replace("\r\n", "\n").Split('\n');
            var tableStart = Array.FindIndex(lines, line => line.Trim() == CriteriaTableHeader);
            if (tableStart == -1)
            {
                result.Text = comment.Trim();
                return result;
            }

            var tableEnd = tableStart + 1;
            for (; tableEnd < lines.Length; tableEnd++)
            {
                var line = lines[tableEnd].Trim();
                if (!line.StartsWith("|") || !line.EndsWith("|")) break;
            }

            // Первые две строки таблицы — заголовок и разделитель «| --- | --- |»
            foreach (var line in lines.Skip(tableStart + 2).Take(tableEnd - tableStart - 2))
            {
                var cells = line.Trim().Trim('|').Split('|').Select(cell => cell.Trim()).ToArray();
                if (cells.Length >= 2) result.Criteria.Add((cells[0], cells[1]));
            }

            result.Text = string.Join("\n", lines.Take(tableStart).Concat(lines.Skip(tableEnd))).Trim();
            return result;
        }
    }
}
