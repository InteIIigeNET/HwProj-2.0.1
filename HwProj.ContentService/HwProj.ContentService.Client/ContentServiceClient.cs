using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using HwProj.HttpUtils;
using HwProj.Models.ContentService.DTO;
using HwProj.Models.Result;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

namespace HwProj.ContentService.Client
{
    public class ContentServiceClient : IContentServiceClient
    {
        private readonly HttpClient _httpClient;
        private readonly Uri _contentServiceUri;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ContentServiceClient(IHttpClientFactory clientFactory, IHttpContextAccessor httpContextAccessor,
            IConfiguration configuration)
        {
            _httpContextAccessor = httpContextAccessor;
            _httpClient = clientFactory.CreateClient();
            _contentServiceUri = new Uri(configuration.GetSection("Services")["Content"]);
        }

        public async Task<Result> ProcessFilesAsync(ProcessFilesDTO processFilesDto)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _contentServiceUri + "api/Files/process");

            var multipartContent = new MultipartFormDataContent();
            multipartContent.Add(new StringContent(processFilesDto.FilesScope.CourseId.ToString()),
                "FilesScope.CourseId");
            multipartContent.Add(new StringContent(processFilesDto.FilesScope.CourseUnitType),
                "FilesScope.CourseUnitType");
            multipartContent.Add(new StringContent(processFilesDto.FilesScope.CourseUnitId.ToString()),
                "FilesScope.CourseUnitId");

            // Добавляем идентификаторы файлов, подлежащих удалению
            foreach (var fileId in processFilesDto.DeletingFileIds)
                multipartContent.Add(new StringContent(fileId.ToString()), "deletingFileIds");

            // Добавляем все файлы
            foreach (var file in processFilesDto.NewFiles)
            {
                var fileStreamContent = new StreamContent(file.OpenReadStream());
                fileStreamContent.Headers.ContentType = MediaTypeHeaderValue.Parse(file.ContentType);
                multipartContent.Add(fileStreamContent, "newFiles", file.FileName);
            }

            httpRequest.Content = multipartContent;
            httpRequest.TryAddUserId(_httpContextAccessor);

            try
            {
                await _httpClient.SendAsync(httpRequest);
                return Result.Success();
            }
            catch (HttpRequestException e)
            {
                return Result.Failed(
                    "Пока не можем обработать файлы. \nПожалуйста, попробуйте повторить позже");
            }
        }

        public async Task<Result<FileInfoDTO[]>> GetFilesStatuses(ScopeDTO scopeDto)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _contentServiceUri + "api/Files/statuses")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(scopeDto),
                    Encoding.UTF8,
                    "application/json")
            };

            try
            {
                var response = await _httpClient.SendAsync(httpRequest);
                var filesStatuses = await response.DeserializeAsync<FileInfoDTO[]>();
                return Result<FileInfoDTO[]>.Success(filesStatuses);
            }
            catch (HttpRequestException e)
            {
                return Result<FileInfoDTO[]>.Failed(
                    "Пока не можем получить информацию о файлах. \nВсе ваши данные сохранены — попробуйте повторить позже");
            }
        }

        public async Task<Result<FileLinkDTO>> GetDownloadLinkAsync(long fileId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _contentServiceUri + $"api/Files/downloadLink?fileId={fileId}");

            try
            {
                var response = await _httpClient.SendAsync(httpRequest);
                var result = await response.DeserializeAsync<FileLinkDTO>();

                return Result<FileLinkDTO>.Success(result);
            }
            catch (HttpRequestException e)
            {
                return Result<FileLinkDTO>.Failed(
                    "Пока не можем открыть файл. \nВсе ваши данные сохранены — попробуйте повторить позже");
            }
        }

        public async Task<Result<FileInfoDTO[]>> GetFilesInfo(long courseId)
        {
            var url = _contentServiceUri + $"api/Files/info/course/{courseId}";
            using var httpRequest = new HttpRequestMessage(HttpMethod.Get, url);

            try
            {
                var response = await _httpClient.SendAsync(httpRequest);
                var filesInfo = await response.DeserializeAsync<FileInfoDTO[]>();
                return Result<FileInfoDTO[]>.Success(filesInfo);
            }
            catch (HttpRequestException e)
            {
                return Result<FileInfoDTO[]>.Failed(
                    "Пока не можем получить информацию о файлах. \nВсе ваши данные сохранены — попробуйте повторить позже");
            }
        }

        public async Task<Result<FileInfoDTO[]>> GetUploadedFilesInfo(long courseId)
        {
            var url = _contentServiceUri + $"api/Files/info/course/{courseId}/uploaded";
            using var httpRequest = new HttpRequestMessage(HttpMethod.Get, url);

            try
            {
                var response = await _httpClient.SendAsync(httpRequest);
                var filesInfo = await response.DeserializeAsync<FileInfoDTO[]>();
                return Result<FileInfoDTO[]>.Success(filesInfo);
            }
            catch (HttpRequestException e)
            {
                return Result<FileInfoDTO[]>.Failed(
                    "Пока не можем получить информацию о файлах. \nВсе ваши данные сохранены — попробуйте повторить позже");
            }
        }

        public async Task<Result> TransferFilesFromCourse(CourseFilesTransferDto filesTransfer)
        {
            var url = _contentServiceUri + "api/Files/transfer";
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, url)
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(filesTransfer),
                    Encoding.UTF8,
                    "application/json")
            };

            try
            {
                await _httpClient.SendAsync(httpRequest);
                return Result.Success();
            }
            catch (HttpRequestException e)
            {
                return Result.Failed("Не удалось перенести информацию о файлах — попробуйте повторить позже");
            }
        }

        public async Task<bool> Ping()
        {
            try
            {
                await _httpClient.GetAsync(_contentServiceUri + "api/system/ping");
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
