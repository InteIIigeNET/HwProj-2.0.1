using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using HwProj.APIGateway.API.Models.Statistics;
using HwProj.Models.CoursesService;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.SolutionsService;
using Microsoft.EntityFrameworkCore.Internal;
using OfficeOpenXml;
using OfficeOpenXml.Style;

namespace HwProj.APIGateway.API.TableGenerators
{
    /// <summary>
    /// Implements course report generation.
    /// </summary>
    public static class ExcelGenerator
    {
        /// <summary>
        /// Font used in the reports.
        /// </summary>
        public static string FontFamily { get; set; } = "Calibri";

        /// <summary>
        /// Font size used in the reports.
        /// </summary>
        public static int FontSize { get; set; } = 11;

        /// <summary>
        /// Color for font to use in test headers.
        /// </summary>
        private static Color WhiteColor { get; set; } = Color.White;
        public static string WhiteArgbColor = "FFFFFFFF";
        public static (float Alpha, float Red, float Green, float Blue) WhiteFloatColor { get; set; } =
            (1, 1, 1, 1);

        /// <summary>
        /// Cyan color used to indicate unrated solutions.
        /// </summary>
        private static Color CyanColor { get; set; } = Color.Cyan;
        public static string CyanArgbColor { get; set; } = "FF00FFFF";
        public static (float Alpha, float Red, float Green, float Blue) CyanFloatColor { get; set; } =
            (1, 0, 1, 1);

        /// <summary>
        /// Gray color used with separation columns.
        /// </summary>
        private static Color GrayColor { get; set; } = Color.FromArgb(255, 80, 80, 80);
        public static string GrayArgbColor { get; set; } = "FF505050";
        public static (float Alpha, float Red, float Green, float Blue) GrayFloatColor { get; set; } =
            (1, (float)0.3137, (float)0.3137, (float)0.3137);

        /// <summary>
        /// Header color for tests.
        /// </summary>
        private static Color TestHeaderColor { get; set; } = Color.FromArgb(255, 63, 81, 181);
        public static string TestHeaderArgbColor = "FF3F51B5";
        public static (float Alpha, float Red, float Green, float Blue) TestHeaderFloatColor { get; set; } =
            (1, (float)0.2471, (float)0.3176, (float)0.7098);

        private static ExcelBorderStyle BorderStyle { get; set; } = ExcelBorderStyle.Thin;

        public static string EquivalentBorderStyle { get; set; } = "SOLID";

        private static int SeparationColumnWidth { get; set; } = 2;

        private static string GetTagLabel(string tag)
        {
            return tag switch
            {
                HomeworkTags.Test => "Тест",
                HomeworkTags.BonusTask => "Бонус",
                HomeworkTags.GroupWork => "Командное",
                _ => tag,
            };
        }

        /// <summary>
        /// Generates course statistics file based on the model from HwProj.APIGateway.Tests.Test.xlsx file.
        /// </summary>
        /// <param name="courseMatesModels">Information about the success of the course participants.</param>
        /// <param name="course">Course information.</param>
        /// <param name="sheetName">Name of the building sheet.</param>
        /// <returns>generated package.</returns>
        public static ExcelPackage Generate(
            List<StatisticsCourseMatesModel> courseMatesModels,
            CourseDTO course,
            string sheetName)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            var excelPackage = new ExcelPackage();
            var worksheet = excelPackage.Workbook.Worksheets.Add(sheetName);

            var rowsNumber = 3 + courseMatesModels.Count;

            var position = new Position(1, 1);

            worksheet.Cells[position.Row, position.Column, position.Row + 2, position.Column].Merge = true;
            ++position.Column;

            AddHomeworksHeaders(worksheet, course, position, rowsNumber, SeparationColumnWidth);
            var columnsNumber = position.Column - 1;
            position.ToNextRow(2);

            AddTasksHeaders(worksheet, course, position, rowsNumber);
            position.ToNextRow(2);

            AddRatingHeadersWithBottomBorder(worksheet, course, position);
            position.ToNextRow(1);

            var maxFieldPosition = new Position(position.Row, 3);
            var (maxRatingForHw, maxRatingForTests) = AddTasksMaxRatingInfo(
                worksheet, course, rowsNumber, maxFieldPosition);

            var totalRatings = AddCourseMatesInfo(course, worksheet, courseMatesModels, position);

            columnsNumber += AddSummary(
                worksheet, maxRatingForHw, maxRatingForTests, totalRatings, rowsNumber, SeparationColumnWidth);

            var headersRange = worksheet.Cells[1, 1, 3, columnsNumber];
            headersRange.Style.Font.Bold = true;

            var range = worksheet.Cells[1, 1, rowsNumber, columnsNumber];
            range.Style.Font.Size = FontSize;
            range.Style.Font.Name = FontFamily;
            range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            range.Style.VerticalAlignment = ExcelVerticalAlignment.Center;

            return excelPackage;
        }

        private static void AddBorderedSeparationColumn(ExcelWorksheet worksheet, Position position, int heightInCells, int columnWidth)
        {
            var range = worksheet.Cells[1, position.Column, heightInCells, position.Column];
            range.Style.Fill.PatternType = ExcelFillStyle.Solid;
            range.Style.Fill.BackgroundColor.SetColor(GrayColor);
            worksheet.Column(position.Column).Width = columnWidth;
            ++position.Column;
        }

        private static void AddHomeworksHeaders(ExcelWorksheet worksheet, CourseDTO course, Position position,
            int heightInCells, int separationColumnWidth)
        {
            for (var i = 0; i < course.Homeworks.Length; ++i)
            {
                var numberCellsToMerge = course.Homeworks[i].Tasks.Count * 3;
                if (numberCellsToMerge == 0) continue;

                var title = course.Homeworks[i].Title;
                var publicationDate = course.Homeworks[i].PublicationDate;
                var tags = course.Homeworks[i].Tags.Where(t => !string.IsNullOrWhiteSpace(t)).ToList();
                var isTest = tags.Contains(HomeworkTags.Test);
                var tagsStr = $" ({tags.Select(GetTagLabel).Join(", ")})";

                worksheet.Cells[position.Row, position.Column].Value
                    = $"h/w {i + 1}: {title}, {publicationDate:dd.MM}{(tags.Count > 0 ? tagsStr : "")}";
                worksheet.Cells[position.Row, position.Column, position.Row, position.Column + numberCellsToMerge - 1]
                    .Merge = true;
                if (isTest)
                {
                    var range = worksheet.Cells[
                        position.Row, position.Column, position.Row + 2, position.Column + numberCellsToMerge - 1];
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(TestHeaderColor);
                    range.Style.Font.Color.SetColor(WhiteColor);
                }

                position.Column += numberCellsToMerge;
                AddBorderedSeparationColumn(worksheet, position, heightInCells, separationColumnWidth);
            }
        }

        private static void AddTasksHeaders(ExcelWorksheet worksheet, CourseDTO course, Position position,
            int heightInCells)
        {
            for (var i = 0; i < course.Homeworks.Length; ++i)
            {
                var numberOfTasks = course.Homeworks[i].Tasks.Count;
                if (numberOfTasks == 0) continue;

                for (var j = 0; j < numberOfTasks; ++j)
                {
                    if (j > 0)
                    {
                        var rangeForBordering =
                            worksheet.Cells[position.Row, position.Column, heightInCells, position.Column];
                        rangeForBordering.Style.Border.Left.Style = BorderStyle;
                    }

                    worksheet.Cells[position.Row, position.Column].Value
                        = $"{j + 1}. {course.Homeworks[i].Tasks[j].Title}";
                    worksheet.Cells[position.Row, position.Column, position.Row, position.Column + 2].Merge = true;
                    position.Column += 3;
                }

                ++position.Column;
            }
        }

        private static void AddRatingHeadersWithBottomBorder(ExcelWorksheet worksheet, CourseDTO course,
            Position position)
        {
            for (var i = 0; i < course.Homeworks.Length; ++i)
            {
                var lengthInCells = course.Homeworks[i].Tasks.Count * 3;
                if (lengthInCells == 0) continue;

                for (var j = position.Column; j < position.Column + lengthInCells; j += 3)
                {
                    worksheet.Cells[position.Row, j].Value = "оценка";
                    worksheet.Cells[position.Row, j + 1].Value = "макс. балл";
                    worksheet.Cells[position.Row, j + 2].Value = "попытки";
                    worksheet.Cells[position.Row, j, position.Row, j + 2].Style.Border.Bottom.Style = BorderStyle;
                }

                position.Column += lengthInCells;
                ++position.Column;
            }
        }

        private static (int MaxRatingForHw, int MaxRatingForTests) AddTasksMaxRatingInfo(
            ExcelWorksheet worksheet,
            CourseDTO course,
            int heightInCells,
            Position firstMaxFieldPosition)
        {
            var maxRatingForHw = 0;
            var maxRatingForTests = 0;

            for (var i = 0; i < course.Homeworks.Length; ++i)
            {
                var numberOfTasks = course.Homeworks[i].Tasks.Count;
                if (numberOfTasks == 0) continue;

                for (var j = 0; j < numberOfTasks; ++j)
                {
                    var maxRating = course.Homeworks[i].Tasks[j].MaxRating;
                    var isTest = course.Homeworks[i].Tasks[j].Tags.Contains(HomeworkTags.Test);
                    var isBonus = course.Homeworks[i].Tasks[j].Tags.Contains(HomeworkTags.BonusTask);

                    for (var k = firstMaxFieldPosition.Row; k <= heightInCells; ++k)
                    {
                        worksheet.Cells[k, firstMaxFieldPosition.Column].Value = maxRating;
                    }

                    firstMaxFieldPosition.Column += 3;
                    if (isBonus) continue;
                    if (isTest) maxRatingForTests += maxRating;
                    else maxRatingForHw += maxRating;
                }

                ++firstMaxFieldPosition.Column;
            }

            return (maxRatingForHw, maxRatingForTests);
        }

        private static List<(int HwRating, int TestRating)> AddCourseMatesInfo(
            CourseDTO course,
            ExcelWorksheet worksheet,
            List<StatisticsCourseMatesModel> courseMatesModels,
            Position position)
        {
            var totalRatings = new List<(int, int)>();

            for (var i = 0; i < courseMatesModels.Count; ++i)
            {
                var (hwRating, testRating) = (0, 0);
                worksheet.Cells[position.Row, position.Column].Value
                    = $"{courseMatesModels[i].Name} {courseMatesModels[i].Surname}";
                ++position.Column;

                for (var j = 0; j < courseMatesModels[i].Homeworks.Count; ++j)
                {
                    var homeworkModel = course.Homeworks.FirstOrDefault(h => h.Id == courseMatesModels[i].Homeworks[j].Id);
                    var isTest = homeworkModel.Tags.Contains(HomeworkTags.Test);

                    for (var k = 0; k < courseMatesModels[i].Homeworks[j].Tasks.Count; ++k)
                    {
                        var allSolutions = courseMatesModels[i].Homeworks[j].Tasks[k].Solution;
                        var solutions = allSolutions
                            .Where(solution =>
                                solution.State == SolutionState.Rated || solution.State == SolutionState.Final);
                        var current = solutions.Any() ? solutions.Last().Rating : 0;
                        var count = solutions.Count();
                        worksheet.Cells[position.Row, position.Column].Value = current;
                        worksheet.Cells[position.Row, position.Column + 2].Value = count;
                        if (count != allSolutions.Count)
                        {
                            worksheet.Cells[position.Row, position.Column + 2]
                                .Style.Fill.PatternType = ExcelFillStyle.Solid;
                            worksheet.Cells[position.Row, position.Column + 2]
                                .Style.Fill.BackgroundColor.SetColor(CyanColor);
                        }

                        if (isTest) testRating += current;
                        else hwRating += current;
                        position.Column += 3;
                    }

                    ++position.Column;
                }

                totalRatings.Add((hwRating, testRating));
                position.ToNextRow(1);
            }

            return totalRatings;
        }

        private static int AddSummary(ExcelWorksheet worksheet,
            int maxRatingForHw,
            int maxRatingForTests,
            List<(int HwRating, int TestRating)> totalRatings,
            int heightInCells,
            int separationColumnWidth)
        {
            if (totalRatings.Count == 0) return 0;
            var hasHomework = maxRatingForHw > 0;
            var hasTests = maxRatingForTests > 0;

            if (hasTests)
            {
                worksheet.Cells[1, 2].Insert(eShiftTypeInsert.EntireColumn);
                worksheet.Cells[1, 2].Value = "Итоговые баллы";
                worksheet.Cells[2, 2].Value = $"КР ({maxRatingForTests})";
                worksheet.Cells[2, 2, 3, 2].Merge = true;
                worksheet.Cells[4, 2, 4 + totalRatings.Count - 1, 2].FillList(totalRatings.Select(p => p.TestRating));
            }
            if (hasHomework)
            {
                worksheet.Cells[1, 2].Insert(eShiftTypeInsert.EntireColumn);
                worksheet.Cells[1, 2].Value = "Итоговые баллы";
                worksheet.Cells[2, 2].Value = $"ДЗ ({maxRatingForHw})";
                worksheet.Cells[2, 2, 3, 2].Merge = true;
                worksheet.Cells[4, 2, 4 + totalRatings.Count - 1, 2].FillList(totalRatings.Select(p => p.HwRating));
            }

            var cellsToMerge = (hasHomework ? 1 : 0) + (hasTests ? 1 : 0);
            if (cellsToMerge > 0)
            {
                worksheet.Cells[1, 2, 1, 1 + cellsToMerge].Merge = true;
                worksheet.Cells[1, 2 + cellsToMerge].Insert(eShiftTypeInsert.EntireColumn);
                AddBorderedSeparationColumn(
                    worksheet, new Position(1, 2 + cellsToMerge), heightInCells, separationColumnWidth);
                worksheet.Cells[2, 2, 3, 1 + cellsToMerge].Style.Border.Bottom.Style = BorderStyle;
            }

            return cellsToMerge;
        }

        private class Position
        {
            /// <summary>
            /// Initializes a new instance of the <see cref="Position"/> class.
            /// </summary>
            /// <param name="rowPosition">The row number at the current position.</param>
            /// <param name="columnPosition">The column number at the current position.</param>
            public Position(int rowPosition, int columnPosition)
            {
                this.Row = rowPosition;
                this.Column = columnPosition;
            }

            /// <summary>
            /// Gets or sets the row number at the current position.
            /// </summary>
            public int Row { get; set; }

            /// <summary>
            /// Gets or sets the column number at the current position.
            /// </summary>
            public int Column { get; set; }

            /// <summary>
            /// Moves position to the next row optionally changing column component.
            /// </summary>
            /// <param name="nextRowColumnPosition">New column component of the position.</param>
            public void ToNextRow(int nextRowColumnPosition)
                => (this.Row, this.Column) = (this.Row + 1, nextRowColumnPosition);
        }
    }
}
