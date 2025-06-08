﻿using System;
using HwProj.APIGateway.API.TableGenerators;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Google.Apis.Sheets.v4;
using Google.Apis.Sheets.v4.Data;
using HwProj.APIGateway.API.Models;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.Result;
using Microsoft.AspNetCore.Mvc;
using OfficeOpenXml;
using OfficeOpenXml.Style;

namespace HwProj.APIGateway.API.ExportServices
{
    public class GoogleService
    {
        private readonly SheetsService _sheetsService;

        public GoogleService(SheetsService sheetsService)
        {
            _sheetsService = sheetsService;
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
                var sheetId = await GetSheetId(spreadsheetId, sheetName);
                if (sheetId == null) return Result.Failed("Лист с таким названием не найден");

                var (valueRange, range, updateStyleRequestBody) = Generate(
                    statistics.ToList(), course, sheetName, (int)sheetId);

                var clearRequest = _sheetsService.Spreadsheets.Values.Clear(new ClearValuesRequest(), spreadsheetId, range);
                await clearRequest.ExecuteAsync();
                var updateStyleRequest = _sheetsService.Spreadsheets.BatchUpdate(updateStyleRequestBody, spreadsheetId);
                await updateStyleRequest.ExecuteAsync();
                var updateRequest = _sheetsService.Spreadsheets.Values.Update(valueRange, spreadsheetId, range);
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
                var spreadsheet = await _sheetsService.Spreadsheets.Get(spreadsheetId).ExecuteAsync();
                return Result<string[]>.Success(spreadsheet.Sheets.Select(t => t.Properties.Title).ToArray());
            }
            catch (Exception ex)
            {
                return Result<string[]>.Failed($"Ошибка при обращении к Google Docs: {ex.Message}");
            }
        }

        public static Result<string> ParseLink(string sheetUrl)
        {
            var match = Regex.Match(sheetUrl, "https://docs\\.google\\.com/spreadsheets/d/(?<id>.+)/");
            return match.Success ? Result<string>.Success(match.Groups["id"].Value)
                : Result<string>.Failed("Некорректная ссылка на страницу Google Docs");
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
            var redCellsAddresses = new List<string>();
            var grayCellsAddresses = new List<string>();
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

                    if (cell.Style.Fill.BackgroundColor.Rgb == ExcelGenerator.BlueArgbColor)
                    {
                        redCellsAddresses.Add(cell.LocalAddress);
                    }
                    else if (cell.Style.Fill.BackgroundColor.Rgb == ExcelGenerator.GrayArgbColor)
                    {
                        grayCellsAddresses.Add(cell.LocalAddress);
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
            AddMergeRequests(batchUpdateRequest, worksheet, sheetId, worksheet.MergedCells);
            AddColouredCellsRequests(batchUpdateRequest, worksheet, sheetId, redCellsAddresses, ExcelGenerator.BlueFloatArgbColor);
            AddColouredCellsRequests(batchUpdateRequest, worksheet, sheetId, grayCellsAddresses, ExcelGenerator.GrayFloatArgbColor);
            AddUpdateCellsWidthRequest(batchUpdateRequest, worksheet, sheetId, grayCellsAddresses, SeparationColumnPixelWidth);
            AddCellsFormattingRequest(batchUpdateRequest, worksheet, sheetId, range);
            AddHeadersFormattingRequest(batchUpdateRequest, worksheet, sheetId, $"{sheetName}!A1:{headersFieldEndAddress}");
            AddBordersFormattingRequest(batchUpdateRequest, worksheet, sheetId, cellsWithBorderAddresses, ExcelGenerator.EquivalentBorderStyle);
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

        private static void AddColouredCellsRequests(
            BatchUpdateSpreadsheetRequest batchUpdateRequest,
            ExcelWorksheet worksheet,
            int sheetId,
            List<string> colouredCellsAddresses,
            (float Alpha, float Red, float Green, float Blue) color)
        {
            for (var i = 0; i < colouredCellsAddresses.Count; ++i)
            {
                var cellAddress = colouredCellsAddresses[i];
                var colorInRedRequest = new RepeatCellRequest();
                colorInRedRequest.Range = FillGridRange(worksheet, cellAddress, sheetId);
                var cell = new CellData();
                cell.UserEnteredFormat = new CellFormat();
                cell.UserEnteredFormat.BackgroundColor = new Color()
                {
                    Alpha = color.Alpha,
                    Red = color.Red,
                    Green = color.Green,
                    Blue = color.Blue,
                };
                colorInRedRequest.Fields = "userEnteredFormat(backgroundColor)";
                colorInRedRequest.Cell = cell;

                var request = new Request();
                request.RepeatCell = colorInRedRequest;
                batchUpdateRequest.Requests.Add(request);
            }
        }

        private async Task<int?> GetSheetId(string spreadsheetId, string sheetName)
        {
            var spreadsheetGetRequest = _sheetsService.Spreadsheets.Get(spreadsheetId);
            spreadsheetGetRequest.IncludeGridData = true;
            try
            {
                var spreadsheetResponse = await spreadsheetGetRequest.ExecuteAsync();
                var sheetId = spreadsheetResponse.Sheets.First(sheet => sheet.Properties.Title == sheetName).Properties.SheetId;
                return sheetId;
            }
            catch (Exception)
            {
                return null;
            }
        }
    }
}