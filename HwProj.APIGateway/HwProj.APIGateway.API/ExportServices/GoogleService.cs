using System;
using HwProj.APIGateway.API.TableGenerators;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Google.Apis.Sheets.v4;
using Google.Apis.Sheets.v4.Data;
using HwProj.APIGateway.API.Models.Statistics;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.Result;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using Google;
using System.Net;

namespace HwProj.APIGateway.API.ExportServices
{
    public class GoogleService
    {
        private readonly SheetsService _internalGoogleSheetsService;

        public GoogleService(SheetsService internalGoogleSheetsService)
        {
            _internalGoogleSheetsService = internalGoogleSheetsService;
        }

        private static int SeparationColumnPixelWidth { get; set; } = 20;

        public async Task<Result> Export(
            CourseDTO course,
            IOrderedEnumerable<StatisticsCourseMatesModel> statistics,
            string sheetUrl,
            string sheetName)
        {
            if (sheetName == string.Empty || sheetUrl == string.Empty)
                return Result.Failed("Ошибка при получении данных о гугл-документе");

            var gettingSpreadsheetIdResult = ParseLink(sheetUrl);
            if (!gettingSpreadsheetIdResult.Succeeded) return Result.Failed(gettingSpreadsheetIdResult.Errors);
            var spreadsheetId = gettingSpreadsheetIdResult.Value;
            Result result;
            try
            {
                var sheetProperties = await GetSheetProperties(spreadsheetId, sheetName);
                if (sheetProperties?.SheetId == null || sheetProperties.GridProperties.RowCount == null ||
                    sheetProperties.GridProperties.ColumnCount == null)
                    return Result.Failed("Лист с таким названием не найден");

                var (valueRange, range, updateStyleRequestBody) = Generate(
                    statistics.ToList(), course, sheetName, (int)sheetProperties.SheetId);

                var rowDifference = valueRange.Values.Count - (int)sheetProperties.GridProperties.RowCount;
                var columnDifference = valueRange.Values.First().Count - (int)sheetProperties.GridProperties.ColumnCount;

                if (rowDifference > 0 || columnDifference > 0)
                {
                    var appendBatchRequest = GetAppendDimensionBatchRequest(
                        (int)sheetProperties.SheetId, rowDifference, columnDifference);
                    var appendDimensionRequest = _internalGoogleSheetsService.Spreadsheets.
                        BatchUpdate(appendBatchRequest, spreadsheetId);
                    await appendDimensionRequest.ExecuteAsync();
                }

                var clearRequest = _internalGoogleSheetsService.Spreadsheets.Values.Clear(new ClearValuesRequest(), spreadsheetId, range);
                await clearRequest.ExecuteAsync();
                var updateStyleRequest = _internalGoogleSheetsService.Spreadsheets.BatchUpdate(updateStyleRequestBody, spreadsheetId);
                await updateStyleRequest.ExecuteAsync();
                var updateRequest = _internalGoogleSheetsService.Spreadsheets.Values.Update(valueRange, spreadsheetId, range);
                updateRequest.ValueInputOption = SpreadsheetsResource.ValuesResource.UpdateRequest.ValueInputOptionEnum.USERENTERED;
                await updateRequest.ExecuteAsync();
                result = Result.Success();
            }
            catch (Exception e)
            {
                result = Result.Failed($"Ошибка: {e.Message}");
            }

            return result;
        }

        public async Task<Result<string[]>> GetSheetTitles(string sheetUrl)
        {
            var processingResult = ParseLink(sheetUrl);
            if (!processingResult.Succeeded) return Result<string[]>.Failed(processingResult.Errors);

            var spreadsheetId = processingResult.Value;
            try
            {
                var spreadsheet = await _internalGoogleSheetsService.Spreadsheets.Get(spreadsheetId).ExecuteAsync();
                return Result<string[]>.Success(spreadsheet.Sheets.Select(t => t.Properties.Title).ToArray());
            }
            catch (GoogleApiException ex)
            {
                var message = $"Ошибка при обращении к Google Sheets: {ex.Message}";
                if (ex.Error.Code == (int)HttpStatusCode.NotFound)
                {
                    message = "Таблица не найдена, проверьте корректность ссылки";
                }
                else if (ex.Error.Code == (int)HttpStatusCode.Forbidden)
                {
                    message = "Нет прав не редактирование таблицы, проверьте настройки доступа";
                }

                return Result<string[]>.Failed(message);
            }
        }

        public static Result<string> ParseLink(string sheetUrl)
        {
            var match = Regex.Match(sheetUrl, "https://docs\\.google\\.com/spreadsheets/d/(?<id>.+)/");
            return match.Success ? Result<string>.Success(match.Groups["id"].Value)
                : Result<string>.Failed("Некорректная ссылка на страницу Google Docs");
        }

        private static BatchUpdateSpreadsheetRequest GetAppendDimensionBatchRequest(
            int sheetId,
            int rowDifference,
            int columnDifference)
        {
            var batchUpdateRequest = new BatchUpdateSpreadsheetRequest();
            batchUpdateRequest.Requests = new List<Request>();

            if (rowDifference > 0)
            {
                var appendRowsRequest = new AppendDimensionRequest();
                appendRowsRequest.SheetId = sheetId;
                appendRowsRequest.Dimension = "ROWS";
                appendRowsRequest.Length = rowDifference;
                var request = new Request();
                request.AppendDimension = appendRowsRequest;
                batchUpdateRequest.Requests.Add(request);
            }

            if (columnDifference > 0)
            {
                var appendColumnsRequest = new AppendDimensionRequest();
                appendColumnsRequest.SheetId = sheetId;
                appendColumnsRequest.Dimension = "COLUMNS";
                appendColumnsRequest.Length = columnDifference;
                var request = new Request();
                request.AppendDimension = appendColumnsRequest;
                batchUpdateRequest.Requests.Add(request);
            }

            return batchUpdateRequest;
        }

        /// <summary>
        /// Generates query data to create a report in Google Sheets.
        /// </summary>
        /// <param name="courseMatesModels">Information about the success of the course participants.</param>
        /// <param name="course">Course information.</param>
        /// <param name="sheetName">Building sheet name.</param>
        /// <param name="sheetId">Building sheet Id.</param>
        /// <returns>Data for executing queries to the Google Sheets.</returns>
        private static (ValueRange ValueRange, string Range, BatchUpdateSpreadsheetRequest UpdateStyleRequest) Generate
            (List<StatisticsCourseMatesModel> courseMatesModels,
            CourseDTO course,
            string sheetName,
            int sheetId)
        {
            var package = ExcelGenerator.Generate(courseMatesModels, course, sheetName);
            var worksheet = package.Workbook.Worksheets[sheetName];
            var rangeWithSheetTitle = worksheet.Dimension.FullAddress;
            var range = worksheet.Dimension.LocalAddress;

            var headersFieldEndAddress = string.Empty;
            var whiteForegroundAddresses = new List<string>();
            var blueCellsAddresses = new List<string>();
            var grayCellsAddresses = new List<string>();
            var testHeaderCellsAddresses = new List<string>();
            var cellsWithBorderAddresses = new List<(string CellAddress, string BorderType)>();

            var valueRange = new ValueRange()
            {
                Values = new List<IList<object>>(),
            };
            for (var i = 1; i <= worksheet.Dimension.End.Row; ++i)
            {
                var row = new List<object>();
                for (var j = 1; j <= worksheet.Dimension.End.Column; ++j)
                {
                    var cell = worksheet.Cells[i, j];
                    row.Add(cell.Value);
                    if (cell.Style.Font.Bold)
                    {
                        headersFieldEndAddress = cell.LocalAddress;
                    }
                    if (cell.Style.Font.Color.Rgb == ExcelGenerator.WhiteArgbColor)
                    {
                        whiteForegroundAddresses.Add(cell.LocalAddress);
                    }

                    if (cell.Style.Fill.BackgroundColor.Rgb == ExcelGenerator.CyanArgbColor)
                    {
                        blueCellsAddresses.Add(cell.LocalAddress);
                    }
                    else if (cell.Style.Fill.BackgroundColor.Rgb == ExcelGenerator.GrayArgbColor)
                    {
                        grayCellsAddresses.Add(cell.LocalAddress);
                    }
                    else if (cell.Style.Fill.BackgroundColor.Rgb == ExcelGenerator.TestHeaderArgbColor)
                    {
                        testHeaderCellsAddresses.Add(cell.LocalAddress);
                    }

                    if (cell.Style.Border.Top.Style != ExcelBorderStyle.None)
                    {
                        cellsWithBorderAddresses.Add((cell.LocalAddress, "top"));
                    }
                    if (cell.Style.Border.Bottom.Style != ExcelBorderStyle.None)
                    {
                        cellsWithBorderAddresses.Add((cell.LocalAddress, "bottom"));
                    }
                    if (cell.Style.Border.Left.Style != ExcelBorderStyle.None)
                    {
                        cellsWithBorderAddresses.Add((cell.LocalAddress, "left"));
                    }
                    if (cell.Style.Border.Right.Style != ExcelBorderStyle.None)
                    {
                        cellsWithBorderAddresses.Add((cell.LocalAddress, "right"));
                    }
                }

                valueRange.Values.Add(row);
            }

            var batchUpdateRequest = new BatchUpdateSpreadsheetRequest();
            batchUpdateRequest.Requests = new List<Request>();
            AddClearStylesRequest(batchUpdateRequest, worksheet, sheetId, range);
            AddColoredCellsRequests(batchUpdateRequest, worksheet, sheetId, blueCellsAddresses, ExcelGenerator.CyanFloatColor);
            AddColoredCellsRequests(batchUpdateRequest, worksheet, sheetId, grayCellsAddresses, ExcelGenerator.GrayFloatColor);
            AddColoredCellsRequests(batchUpdateRequest, worksheet, sheetId, testHeaderCellsAddresses, ExcelGenerator.TestHeaderFloatColor);
            AddColoredFontRequest(batchUpdateRequest, worksheet, sheetId, whiteForegroundAddresses, ExcelGenerator.WhiteFloatColor);
            AddUpdateCellsWidthRequest(batchUpdateRequest, worksheet, sheetId, grayCellsAddresses, SeparationColumnPixelWidth);
            AddCellsFormattingRequest(batchUpdateRequest, worksheet, sheetId, range);
            AddHeadersFormattingRequest(batchUpdateRequest, worksheet, sheetId, $"{sheetName}!A1:{headersFieldEndAddress}");
            AddBordersFormattingRequest(batchUpdateRequest, worksheet, sheetId, cellsWithBorderAddresses, ExcelGenerator.EquivalentBorderStyle);
            AddMergeRequests(batchUpdateRequest, worksheet, sheetId, worksheet.MergedCells);
            return (valueRange, rangeWithSheetTitle, batchUpdateRequest);
        }

            private static GridRange FillGridRange(ExcelWorksheet worksheet, string rangeAddress, int sheetId)
        {
            var gridRange = new GridRange();
            var rangeInfo = worksheet.Cells[rangeAddress];
            gridRange.SheetId = sheetId;
            gridRange.StartRowIndex = rangeInfo.Start.Row - 1;
            gridRange.StartColumnIndex = rangeInfo.Start.Column - 1;
            gridRange.EndRowIndex = rangeInfo.End.Row;
            gridRange.EndColumnIndex = rangeInfo.End.Column;
            return gridRange;
        }

        private static void AddClearStylesRequest(
            BatchUpdateSpreadsheetRequest batchUpdateRequest,
            ExcelWorksheet worksheet,
            int sheetId,
            string range)
        {
            var clearStylesRequest = new RepeatCellRequest();
            clearStylesRequest.Range = FillGridRange(worksheet, range, sheetId);
            var cell = new CellData();
            cell.UserEnteredFormat = new CellFormat();
            clearStylesRequest.Cell = cell;
            clearStylesRequest.Fields = "userEnteredFormat";

            var request = new Request();
            request.RepeatCell = clearStylesRequest;
            batchUpdateRequest.Requests.Add(request);
        }

        private static void AddBordersFormattingRequest(
            BatchUpdateSpreadsheetRequest batchUpdateRequest,
            ExcelWorksheet worksheet,
            int sheetId,
            List<(string CellAddress, string BorderType)> cellsAddresses,
            string bordersStyle)
        {
            foreach (var cell in cellsAddresses)
            {
                var updateBorderRequest = new UpdateBordersRequest();
                var gridRange = FillGridRange(worksheet, cell.CellAddress, sheetId);
                updateBorderRequest.Range = gridRange;
                var border = new Google.Apis.Sheets.v4.Data.Border();
                border.Style = bordersStyle;
                switch (cell.BorderType)
                {
                    case "top":
                        updateBorderRequest.Top = border;
                        break;
                    case "bottom":
                        updateBorderRequest.Bottom = border;
                        break;
                    case "left":
                        updateBorderRequest.Left = border;
                        break;
                    case "right":
                        updateBorderRequest.Right = border;
                        break;
                }

                var request = new Request();
                request.UpdateBorders = updateBorderRequest;
                batchUpdateRequest.Requests.Add(request);
            }
        }

        private static void AddHeadersFormattingRequest(
            BatchUpdateSpreadsheetRequest batchUpdateRequest,
            ExcelWorksheet worksheet,
            int sheetId,
            string range)
        {
            var styleBoldCellsRequest = new RepeatCellRequest();
            styleBoldCellsRequest.Range = FillGridRange(worksheet, range, sheetId);
            var cell = new CellData();
            cell.UserEnteredFormat = new CellFormat();
            cell.UserEnteredFormat.TextFormat = new TextFormat();
            cell.UserEnteredFormat.TextFormat.Bold = true;
            styleBoldCellsRequest.Cell = cell;
            styleBoldCellsRequest.Fields = "userEnteredFormat(textFormat.bold)";

            var request = new Request();
            request.RepeatCell = styleBoldCellsRequest;
            batchUpdateRequest.Requests.Add(request);
        }

        private static void AddCellsFormattingRequest(
            BatchUpdateSpreadsheetRequest batchUpdateRequest,
            ExcelWorksheet worksheet,
            int sheetId,
            string range)
        {
            var cellsFormatRequest = new RepeatCellRequest();
            cellsFormatRequest.Range = FillGridRange(worksheet, range, sheetId);
            var cell = new CellData();
            cell.UserEnteredFormat = new CellFormat();
            cell.UserEnteredFormat.HorizontalAlignment = "CENTER";
            cell.UserEnteredFormat.VerticalAlignment = "MIDDLE";
            cell.UserEnteredFormat.TextFormat = new TextFormat();
            cell.UserEnteredFormat.TextFormat.FontSize = ExcelGenerator.FontSize;
            cell.UserEnteredFormat.TextFormat.FontFamily = ExcelGenerator.FontFamily;
            cellsFormatRequest.Cell = cell;
            cellsFormatRequest.Fields = "userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat.fontSize,textFormat.fontFamily)";

            var request = new Request();
            request.RepeatCell = cellsFormatRequest;
            batchUpdateRequest.Requests.Add(request);
        }

        private static void AddMergeRequests(
            BatchUpdateSpreadsheetRequest batchUpdateRequest,
            ExcelWorksheet worksheet,
            int sheetId,
            ExcelWorksheet.MergeCellsCollection mergeCellsCollection)
        {
            for (var i = 0; i < mergeCellsCollection.Count; ++i)
            {
                var mergedCellsAddress = mergeCellsCollection[i];
                var gridRange = FillGridRange(worksheet, mergedCellsAddress, sheetId);
                var mergeCellsRequest = new MergeCellsRequest();
                mergeCellsRequest.MergeType = "MERGE_ALL";
                mergeCellsRequest.Range = gridRange;

                var request = new Request();
                request.MergeCells = mergeCellsRequest;
                batchUpdateRequest.Requests.Add(request);
            }
        }

        private static void AddUpdateCellsWidthRequest(
            BatchUpdateSpreadsheetRequest batchUpdateRequest,
            ExcelWorksheet worksheet,
            int sheetId,
            List<string> cellsAddresses,
            int cellsPixelWidth)
        {
            for (var i = 0; i < cellsAddresses.Count; ++i)
            {
                var cellAddress = cellsAddresses[i];
                var rangeInfo = worksheet.Cells[cellAddress];
                var updateWidthRequest = new UpdateDimensionPropertiesRequest();
                updateWidthRequest.Range = new DimensionRange()
                {
                    SheetId = sheetId,
                    Dimension = "COLUMNS",
                    StartIndex = rangeInfo.Start.Column - 1,
                    EndIndex = rangeInfo.End.Column,
                };
                updateWidthRequest.Fields = "*";
                updateWidthRequest.Properties = new DimensionProperties();
                updateWidthRequest.Properties.PixelSize = cellsPixelWidth;

                var request = new Request();
                request.UpdateDimensionProperties = updateWidthRequest;
                batchUpdateRequest.Requests.Add(request);
            }
        }

        private static void AddColoredCellsRequests(
            BatchUpdateSpreadsheetRequest batchUpdateRequest,
            ExcelWorksheet worksheet,
            int sheetId,
            List<string> coloredCellsAddresses,
            (float Alpha, float Red, float Green, float Blue) fillColor)
        {
            for (var i = 0; i < coloredCellsAddresses.Count; ++i)
            {
                var cellAddress = coloredCellsAddresses[i];
                var colorCellRequest = new RepeatCellRequest();
                colorCellRequest.Range = FillGridRange(worksheet, cellAddress, sheetId);
                var cell = new CellData();
                cell.UserEnteredFormat = new CellFormat();
                cell.UserEnteredFormat.BackgroundColor = new Color()
                {
                    Alpha = fillColor.Alpha,
                    Red = fillColor.Red,
                    Green = fillColor.Green,
                    Blue = fillColor.Blue,
                };

                colorCellRequest.Fields = $"userEnteredFormat(backgroundColor)";
                colorCellRequest.Cell = cell;

                var request = new Request();
                request.RepeatCell = colorCellRequest;
                batchUpdateRequest.Requests.Add(request);
            }
        }

        private static void AddColoredFontRequest(
            BatchUpdateSpreadsheetRequest batchUpdateRequest,
            ExcelWorksheet worksheet,
            int sheetId,
            List<string> cellsAddresses,
            (float Alpha, float Red, float Green, float Blue) fontColor)
        {
            for (var i = 0; i < cellsAddresses.Count; ++i)
            {
                var cellAddress = cellsAddresses[i];
                var colorFontRequest = new RepeatCellRequest();
                colorFontRequest.Range = FillGridRange(worksheet, cellAddress, sheetId);
                var cell = new CellData();
                cell.UserEnteredFormat = new CellFormat();
                cell.UserEnteredFormat.TextFormat = new TextFormat();
                cell.UserEnteredFormat.TextFormat.ForegroundColor = new Color()
                {
                   Alpha = fontColor.Alpha,
                    Red = fontColor.Red,
                    Green = fontColor.Green,
                    Blue = fontColor.Blue,
                };

                colorFontRequest.Fields = $"userEnteredFormat(textFormat.foregroundColor)";
                colorFontRequest.Cell = cell;

                var request = new Request();
                request.RepeatCell = colorFontRequest;
                batchUpdateRequest.Requests.Add(request);
            }
        }

        private async Task<SheetProperties?> GetSheetProperties(string spreadsheetId, string sheetName)
        {
            var spreadsheetGetRequest = _internalGoogleSheetsService.Spreadsheets.Get(spreadsheetId);
            spreadsheetGetRequest.IncludeGridData = true;
            try
            {
                var spreadsheetResponse = await spreadsheetGetRequest.ExecuteAsync();
                return spreadsheetResponse.Sheets.First(sheet => sheet.Properties.Title == sheetName).Properties;
            }
            catch (Exception)
            {
                return null;
            }
        }
    }
}
