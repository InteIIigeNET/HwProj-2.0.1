using NUnit.Framework;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.StatisticsService;
using HwProj.APIGateway.API.Models;
using HwProj.APIGateway.API.TableGenerators;
using System.Collections.Generic;
using OfficeOpenXml;
using System.IO;
using System;
using HwProj.Models.SolutionsService;
using NUnit.Framework.Interfaces;

namespace HwProj.APIGateway.Tests
{
    [TestFixture]
    public class ExcelGeneratorTests
    {
        private enum CellProperty
        {
            Value,
            Style,
            IsMerge,
        }

        private static readonly string GoldFile = "GoldFile.xlsx";
        private static readonly string TestFile = "TestFile.xlsx";
        private static readonly string TestFileSheetName = "ТестЛист";
        private static readonly CourseMateViewModel[] CourseMates =
        {
            new CourseMateViewModel(),
            new CourseMateViewModel()
        };

        private static readonly HomeworkViewModel[] Homeworks =
        {
            new HomeworkViewModel()
            {
                Title = "TestHomework1",
                PublicationDate = new DateTime(2023, 6, 4),
                Tasks = new List<HomeworkTaskViewModel>()
                {
                    new HomeworkTaskViewModel()
                    {
                        Title = "Task1.1",
                        PublicationDate = new System.DateTime(2023, 6, 4, 14, 0, 0),
                        MaxRating = 8
                    },
                    new HomeworkTaskViewModel()
                    {
                        Title = "Task1.2",
                        PublicationDate = new System.DateTime(2023, 6, 4, 15, 0, 0),
                        MaxRating = 8
                    }
                }
            },
            new HomeworkViewModel()
            {
                Title = "TestHomework2",
                PublicationDate = new System.DateTime(2023, 6, 5),
                Tasks = new List<HomeworkTaskViewModel>
                {
                    new HomeworkTaskViewModel()
                    {
                        Title = "Task2.1",
                        PublicationDate = new System.DateTime(2023, 6, 5, 14, 0, 0),
                        MaxRating = 8
                    },
                    new HomeworkTaskViewModel()
                    {
                        Title = "Task2.2",
                        PublicationDate = new System.DateTime(2023, 6, 5, 15, 0, 0),
                        MaxRating = 8
                    }
                }
            },
        };

        private static readonly CourseDTO Course = new CourseDTO()
        {
            CourseMates = CourseMates,
            Homeworks = Homeworks,
        };

        private static readonly List<StatisticsCourseMatesModel> CourseMatesModels = new List<StatisticsCourseMatesModel>
        {
            new StatisticsCourseMatesModel()
            {
                Name = "Иван", Surname = "Иванов",
                Homeworks = new List<StatisticsCourseHomeworksModel>
                {
                    new StatisticsCourseHomeworksModel()
                    {
                        Tasks = new List<StatisticsCourseTasksModel>
                        {
                            new StatisticsCourseTasksModel()
                            {
                                Solution = new List<Solution>
                                {
                                    new Solution { State = SolutionState.Rated, Rating = 4 },
                                    new Solution() { State = SolutionState.Posted }
                                }
                            },
                            new StatisticsCourseTasksModel()
                            {
                                Solution = new List<Solution>
                                {
                                    new Solution() { State = SolutionState.Posted }
                                }
                            }
                        }
                    },
                    new StatisticsCourseHomeworksModel()
                    {
                        Tasks = new List<StatisticsCourseTasksModel>
                        {
                            new StatisticsCourseTasksModel()
                            {
                                Solution = new List<Solution>()
                            },
                            new StatisticsCourseTasksModel()
                            {
                                Solution = new List<Solution>()
                            }
                        }
                    }
                }
            },
            new StatisticsCourseMatesModel()
            {
                Name = "Петр", Surname = "Петров",
                Homeworks = new List<StatisticsCourseHomeworksModel>
                {
                    new StatisticsCourseHomeworksModel()
                    {
                        Tasks = new List<StatisticsCourseTasksModel>
                        {
                            new StatisticsCourseTasksModel()
                            {
                                Solution = new List<Solution>()
                            },
                            new StatisticsCourseTasksModel()
                            {
                                Solution = new List<Solution>
                                {
                                    new Solution() { State = SolutionState.Rated, Rating = 5 },
                                    new Solution() { State = SolutionState.Rated, Rating = 7 }
                                }
                            }
                        }
                    },
                    new StatisticsCourseHomeworksModel()
                    {
                        Tasks = new List<StatisticsCourseTasksModel>
                        {
                            new StatisticsCourseTasksModel()
                            {
                                Solution = new List<Solution>()
                            },
                            new StatisticsCourseTasksModel()
                            {
                                Solution = new List<Solution>()
                            }
                        }
                    }
                }
            }
        };

        [OneTimeSetUp]
        public void GenerateFile()
        {
            var testPackage = ExcelGenerator.Generate(CourseMatesModels, Course, TestFileSheetName);
            var testFileInfo = new FileInfo(TestFile);
            testPackage.SaveAs(testFileInfo);
        }

        [Test]
        public void CheckTheEquivalenceOfTwoSheetsValues()
        {
            using (var testPackage = new ExcelPackage(TestFile))
            {
                var testSheet = testPackage.Workbook.Worksheets[TestFileSheetName];
                var goldFile = new FileInfo(GoldFile);
                using (var goldPackage = new ExcelPackage(goldFile))
                {
                    var goldSheet = goldPackage.Workbook.Worksheets[TestFileSheetName];
                    Assert.That(IsTwoExcelWorksheetsEquals(goldSheet, testSheet, 5, 14, CellProperty.Value));
                }
            }
        }

        [Test]
        public void CheckTheEquivalenceOfTwoSheetsStructure()
        {
            using (var testPackage = new ExcelPackage(TestFile))
            {
                var testSheet = testPackage.Workbook.Worksheets[TestFileSheetName];
                var goldFile = new FileInfo(GoldFile);
                using (var goldPackage = new ExcelPackage(goldFile))
                {
                    var goldSheet = goldPackage.Workbook.Worksheets[TestFileSheetName];
                    Assert.That(IsTwoExcelWorksheetsEquals(goldSheet, testSheet, 5, 14, CellProperty.IsMerge));
                }
            }
        }

        [Test]
        public void CheckTheEquivalenceOfTwoSheetsStyle()
        {
            using (var testPackage = new ExcelPackage(TestFile))
            {
                var testSheet = testPackage.Workbook.Worksheets[TestFileSheetName];
                var goldFile = new FileInfo(GoldFile);
                using (var goldPackage = new ExcelPackage(goldFile))
                {
                    var goldSheet = goldPackage.Workbook.Worksheets[TestFileSheetName];
                    Assert.That(IsTwoExcelWorksheetsEquals(goldSheet, testSheet, 5, 14, CellProperty.Style));
                }
            }
        }

        [OneTimeTearDown]
        public void DeleteFileIfTestsArePassed()
        {
            if (TestContext.CurrentContext.Result.Outcome == ResultState.Success)
            {
                File.Delete(TestFile);
            }
        }

        private static bool IsTwoExcelWorksheetsEquals(ExcelWorksheet firstSheet, ExcelWorksheet secondSheet,
            int lastRow, int lastCol, CellProperty cellPropertyToCompare)
        {
            var comparer = new Func<ExcelRange, ExcelRange, bool> (Equals);
            switch (cellPropertyToCompare)
            {
                case CellProperty.Value:
                    comparer = ((firstCell, secondCell) =>
                        Equals(firstCell.Value, secondCell.Value));
                    break;
                case CellProperty.Style:
                    comparer = ((firstCell, secondCell) =>
                        firstCell.Style.Font.Bold == secondCell.Style.Font.Bold
                        && firstCell.Style.Font.Name == secondCell.Style.Font.Name
                        && Math.Abs(firstCell.Style.Font.Size - secondCell.Style.Font.Size) < 0.1
                        && firstCell.Style.Fill.BackgroundColor.Rgb == secondCell.Style.Fill.BackgroundColor.Rgb
                        && firstCell.Style.VerticalAlignment == secondCell.Style.VerticalAlignment
                        && firstCell.Style.HorizontalAlignment == secondCell.Style.HorizontalAlignment
                        && firstCell.Style.Border.Left.Style == secondCell.Style.Border.Left.Style
                        && firstCell.Style.Border.Right.Style == secondCell.Style.Border.Right.Style
                        && firstCell.Style.Border.Bottom.Style == secondCell.Style.Border.Bottom.Style
                        && firstCell.Style.Border.Top.Style == secondCell.Style.Border.Top.Style);
                    break;
                case CellProperty.IsMerge:
                    comparer = ((firstCell, secondCell) =>
                        firstCell.Merge == secondCell.Merge);
                    break;
            }

            for (var i = 1; i <= lastRow; ++i)
            {
                for (var j = 1; j <= lastCol; ++j)
                {
                    if (!comparer(firstSheet.Cells[i, j], secondSheet.Cells[i, j]))
                    {
                        return false;
                    }
                }
            }

            return true;
        }
    }
}