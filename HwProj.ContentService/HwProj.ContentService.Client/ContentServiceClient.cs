using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using HwProj.HttpUtils;
using HwProj.Models.ContentService.DTO;
using HwProj.Models.Result;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

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

        public async Task<Result> UploadFileAsync(UploadFileDTO uploadFileDto)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _contentServiceUri + "api/Files/upload");

            var multipartContent = new MultipartFormDataContent();
            multipartContent.Add(new StringContent(uploadFileDto.CourseId.ToString()), "courseId");
            multipartContent.Add(new StringContent(uploadFileDto.HomeworkId.ToString()), "homeworkId");

            var fileStreamContent = new StreamContent(uploadFileDto.File.OpenReadStream());
            fileStreamContent.Headers.ContentType = MediaTypeHeaderValue.Parse(uploadFileDto.File.ContentType);
            multipartContent.Add(fileStreamContent, "file", uploadFileDto.File.FileName);

            httpRequest.Content = multipartContent;
            httpRequest.TryAddUserId(_httpContextAccessor);

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<Result>();
        }

        public async Task<Result<string>> GetDownloadLinkAsync(string fileKey)
        {
            var encodedFileKey = Uri.EscapeDataString(fileKey);
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _contentServiceUri + $"api/Files/downloadLink?key={encodedFileKey}");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<Result<string>>();
        }

        public async Task<CourseFileInfoDTO[]> GetCourseFilesInfo(long courseId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _contentServiceUri + $"api/Files/courseFilesInfo/{courseId}");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<CourseFileInfoDTO[]>();
        }
        
        public async Task<HomeworkFileInfoDTO[]> GetHomeworkFilesInfo(long courseId, long homeworkId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _contentServiceUri + $"api/Files/homeworkFilesInfo/{courseId}/{homeworkId}");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<HomeworkFileInfoDTO[]>();
        }
        
        public async Task<Result> DeleteFileAsync(string fileKey)
        {
            var encodedFileKey = Uri.EscapeDataString(fileKey);
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Delete,
                _contentServiceUri + $"api/Files?key={encodedFileKey}");
            httpRequest.TryAddUserId(_httpContextAccessor);

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<Result>();
        }
    }
}