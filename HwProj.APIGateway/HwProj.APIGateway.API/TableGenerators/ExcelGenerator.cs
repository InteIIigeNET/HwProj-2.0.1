using System.Collections.Generic;
using System.Linq;
using HwProj.APIGateway.API.Models.Statistics;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.SolutionsService;
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
        /// Shade of red used in the reports.
        /// </summary>
        private static (int Alpha, int Red, int Green, int Blue) BlueIntArgbColor { get; set; } = (0, 0, 255, 255);
        public static (float Alpha, float Red, float Green, float Blue) BlueFloatArgbColor { get; set; } = (0, 0, 1, 1);
        public static string BlueArgbColor { get; set; } = "0000FFFF";

        /// <summary>
        /// Shade of gray used in the reports.
        /// </summary>
        private static (int Alpha, int Red, int Green, int Blue) GrayIntArgbColor { get; set; } = (255, 80, 80, 80);

        public static (float Alpha, float Red, float Green, float Blue) GrayFloatArgbColor { get; set; } =
            (1, (float)0.3137, (float)0.3137, (float)0.3137);

        public static string GrayArgbColor { get; set; } = "FF505050";

        private static ExcelBorderStyle BorderStyle { get; set; } = ExcelBorderStyle.Thin;

        public static string EquivalentBorderStyle { get; set; } = "SOLID";

        private static int SeparationColumnWidth { get; set; } = 2;

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
            var columnsNumber = 3 * course.Homeworks.SelectMany(h => h.Tasks).Count();

            ExtendWorksheetIfNecessary(worksheet, columnsNumber);

            var position = new Position(1, 1);

            worksheet.Cells[position.Row, position.Column, position.Row + 2, position.Column].Merge = true;
            ++position.Column;

            AddHomeworksHeaders(worksheet, course, position, rowsNumber, SeparationColumnWidth);
            columnsNumber = position.Column - 2;
            position.ToNextRow(2);

            worksheet.Cells[1, 1, rowsNumber, columnsNumber].Style.Font.Size = FontSize;
            worksheet.Cells[1, 1, rowsNumber, columnsNumber].Style.Font.Name = FontFamily;

            AddTasksHeaders(worksheet, course, position, rowsNumber);
            position.ToNextRow(2);

            AddMinMaxCntHeadersWithBottomBorder(worksheet, course, position);
            position.ToNextRow(1);

            var maxFieldPosition = new Position(position.Row, 3);
            AddTasksMaxRatingInfo(worksheet, course, rowsNumber, maxFieldPosition);

            AddCourseMatesInfo(worksheet, courseMatesModels, position);

            var headersRange = worksheet.Cells[1, 1, 3, columnsNumber];
            headersRange.Style.Font.Bold = true;

            var range = worksheet.Cells[1, 1, rowsNumber, columnsNumber];
            range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            range.Style.VerticalAlignment = ExcelVerticalAlignment.Center;

            return excelPackage;
        }

        private static void ExtendWorksheetIfNecessary(ExcelWorksheet worksheet, int columnsNumber)
        {
            var currentColumnsNumber = worksheet.Columns.Count();
            var columnsToAdd = columnsNumber - currentColumnsNumber;
            if (columnsToAdd > 0)
            {
                worksheet.InsertColumn(currentColumnsNumber, columnsToAdd);
            }
        }

        private static void AddBorderedSeparationColumn(ExcelWorksheet worksheet, Position position, int heightInCells, int columnWidth)
        {
            var range = worksheet.Cells[1, position.Column, heightInCells, position.Column];
            range.Style.Fill.PatternType = ExcelFillStyle.Solid;
            range.Style.Fill.BackgroundColor.SetColor(GrayIntArgbColor.Alpha, GrayIntArgbColor.Red, GrayIntArgbColor.Green, GrayIntArgbColor.Blue);
            worksheet.Column(position.Column).Width = columnWidth;
            ++position.Column;
        }

        private static void AddHomeworksHeaders(ExcelWorksheet worksheet, CourseDTO course, Position position,
            int heightInCells, int separationColumnWidth)
        {
            var homeworkNumber = 1;
            for (var i = 0; i < course.Homeworks.Length; ++i)
            {
                var numberCellsToMerge = course.Homeworks[i].Tasks.Count * 3;
                worksheet.Cells[position.Row, position.Column].Value
                    = $"h/w {homeworkNumber.ToString()}: {course.Homeworks[i].Title}, {course.Homeworks[i].PublicationDate.ToString("dd.MM")}";
                worksheet.Cells[position.Row, position.Column, position.Row, position.Column + numberCellsToMerge - 1]
                    .Merge = true;
                position.Column += numberCellsToMerge;
                AddBorderedSeparationColumn(worksheet, position, heightInCells, separationColumnWidth);
                ++homeworkNumber;
            }
        }

        private static void AddTasksHeaders(ExcelWorksheet worksheet, CourseDTO course, Position position,
            int heightInCells)
        {
            for (var i = 0; i < course.Homeworks.Length; ++i)
            {
                var taskNumber = 1;
                for (var j = 0; j < course.Homeworks[i].Tasks.Count; ++j)
                {
                    if (taskNumber != 1)
                    {
                        var rangeForBordering =
                            worksheet.Cells[position.Row, position.Column, heightInCells, position.Column];
                        rangeForBordering.Style.Border.Left.Style = BorderStyle;
                    }

                    worksheet.Cells[position.Row, position.Column].Value
                        = $"{taskNumber.ToString()}. {course.Homeworks[i].Tasks[j].Title}";
                    worksheet.Cells[position.Row, position.Column, position.Row, position.Column + 2].Merge = true;
                    position.Column += 3;
                    ++taskNumber;
                }

                ++position.Column;
            }
        }

        private static void AddMinMaxCntHeadersWithBottomBorder(ExcelWorksheet worksheet, CourseDTO course,
            Position position)
        {
            for (var i = 0; i < course.Homeworks.Length; ++i)
            {
                var lengthInCells = course.Homeworks[i].Tasks.Count * 3;
                for (var j = position.Column; j < position.Column + lengthInCells; j += 3)
                {
                    worksheet.Cells[position.Row, j].Value = "min";
                    worksheet.Cells[position.Row, j + 1].Value = "max";
                    worksheet.Cells[position.Row, j + 2].Value = "cnt";
                    worksheet.Cells[position.Row, j, position.Row, j + 2].Style.Border.Bottom.Style = BorderStyle;
                }

                position.Column += lengthInCells;
                ++position.Column;
            }
        }

        private static void AddTasksMaxRatingInfo(
            ExcelWorksheet worksheet,
            CourseDTO course,
            int heightInCells,
            Position firstMaxFieldPosition)
        {
            for (var i = 0; i < course.Homeworks.Length; ++i)
            {
                for (var j = 0; j < course.Homeworks[i].Tasks.Count; ++j)
                {
                    for (var k = firstMaxFieldPosition.Row; k <= heightInCells; ++k)
                    {
                        worksheet.Cells[k, firstMaxFieldPosition.Column].Value
                            = course.Homeworks[i].Tasks[j].MaxRating;
                    }

                    firstMaxFieldPosition.Column += 3;
                }

                ++firstMaxFieldPosition.Column;
            }
        }

        private static void AddCourseMatesInfo(
            ExcelWorksheet worksheet,
            List<StatisticsCourseMatesModel> courseMatesModels,
            Position position)
        {
            for (var i = 0; i < courseMatesModels.Count; ++i)
            {
                worksheet.Cells[position.Row, position.Column].Value
                    = $"{courseMatesModels[i].Name} {courseMatesModels[i].Surname}";
                ++position.Column;
                for (var j = 0; j < courseMatesModels[i].Homeworks.Count; ++j)
                {
                    for (var k = 0; k < courseMatesModels[i].Homeworks[j].Tasks.Count; ++k)
                    {
                        var allSolutions = courseMatesModels[i].Homeworks[j].Tasks[k].Solution;
                        var solutions = allSolutions
                            .Where(solution =>
                                solution.State == SolutionState.Rated || solution.State == SolutionState.Final);
                        var min = solutions.Any() ? solutions.Last().Rating : 0;
                        var cnt = solutions.Count();
                        worksheet.Cells[position.Row, position.Column].Value = min;
                        worksheet.Cells[position.Row, position.Column + 2].Value = cnt;
                        if (cnt != allSolutions.Count)
                        {
                            worksheet.Cells[position.Row, position.Column + 2].Style.Fill.PatternType =
                                ExcelFillStyle.Solid;
                            worksheet.Cells[position.Row, position.Column + 2].Style.Fill.BackgroundColor.SetColor(
                                BlueIntArgbColor.Alpha, BlueIntArgbColor.Red, BlueIntArgbColor.Green, BlueIntArgbColor.Blue);
                        }

                        position.Column += 3;
                    }

                    ++position.Column;
                }

                position.ToNextRow(1);
            }
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