using System;
using System.Collections.Generic;
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
                multipartContent.Add(new StringContent(fileId.ToString()), "removingFileIds");

            // Добавляем все файлы
            foreach (var file in processFilesDto.NewFiles)
            {
                var fileStreamContent = new StreamContent(file.OpenReadStream());
                fileStreamContent.Headers.ContentType = MediaTypeHeaderValue.Parse(file.ContentType);
                multipartContent.Add(fileStreamContent, "newFiles", file.FileName);
            }

            httpRequest.Content = multipartContent;
            httpRequest.TryAddUserId(_httpContextAccessor);

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<Result>();
        }

        public async Task<List<FileStatusDTO>> GetFilesStatuses(ScopeDTO scopeDto)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _contentServiceUri + "api/Files/statuses")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(scopeDto),
                    Encoding.UTF8,
                    "application/json")
            };

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<List<FileStatusDTO>>();
        }

        public async Task<Result<string>> GetDownloadLinkAsync(long fileId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _contentServiceUri + $"api/Files/downloadLink?fileId={fileId}");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<Result<string>>();
        }

        public async Task<FileInfoDTO[]> GetFilesInfo(long courseId)
        {
            var url = _contentServiceUri + $"api/Files/info/course/{courseId}";
            using var httpRequest = new HttpRequestMessage(HttpMethod.Get, url); 
            var response = await _httpClient.SendAsync(httpRequest); 
            return await response.DeserializeAsync<FileInfoDTO[]>();
        }
    }
}