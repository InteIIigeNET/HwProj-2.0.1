using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using HwProj.Exceptions;
using HwProj.HttpUtils;
using HwProj.Models.SolutionsService;
using HwProj.Models.StatisticsService;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

namespace HwProj.SolutionsService.Client
{
    public class SolutionsServiceClient : ISolutionsServiceClient
    {
        private readonly HttpClient _httpClient;
        private readonly Uri _solutionServiceUri;

        public SolutionsServiceClient(IHttpClientFactory clientFactory, IConfiguration configuration)
        {
            _httpClient = clientFactory.CreateClient();
            _solutionServiceUri = new Uri(configuration.GetSection("Services")["Solutions"]);
        }

        public async Task<Solution[]> GetAllSolutions()
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _solutionServiceUri + "api/Solutions");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<Solution[]>();
        }

        public async Task<Solution> GetSolutionById(long solutionId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _solutionServiceUri + $"api/Solutions/{solutionId}");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<Solution>();
        }

        public async Task<Solution[]> GetUserSolutions(long taskId, string studentId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _solutionServiceUri + $"api/Solutions/taskSolutions/{taskId}/{studentId}");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<Solution[]>();
        }

        public async Task<long> PostSolution(SolutionViewModel model, long taskId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _solutionServiceUri + $"api/Solutions/{taskId}")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(model),
                    Encoding.UTF8,
                    "application/json")
            };

            var response = await _httpClient.SendAsync(httpRequest);
            if (response.IsSuccessStatusCode)
            {
                return await response.DeserializeAsync<long>();
            }

            throw new ForbiddenException();
        }

        public async Task RateSolution(long solutionId, int newRating, string lecturerComment, string lecturerId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _solutionServiceUri +
                $"api/Solutions/rateSolution/{solutionId}?newRating={newRating}&lecturerComment={lecturerComment}&lecturerId={lecturerId}");

            var response = await _httpClient.SendAsync(httpRequest);
            if (!response.IsSuccessStatusCode)
            {
                throw new ForbiddenException();
            }
        }

        public async Task MarkSolution(long solutionId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _solutionServiceUri + $"api/Solutions/markSolutionFinal/{solutionId}");

            await _httpClient.SendAsync(httpRequest);
        }

        public async Task DeleteSolution(long solutionId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Delete,
                _solutionServiceUri + $"api/Solutions/delete/{solutionId}");

            await _httpClient.SendAsync(httpRequest);
        }

        public async Task<long> PostGroupSolution(SolutionViewModel model, long taskId, long groupId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _solutionServiceUri + $"api/Solutions/{groupId}/{taskId}")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(model),
                    Encoding.UTF8,
                    "application/json")
            };

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<long>();
        }

        public async Task<Solution[]> GetTaskSolutions(long groupId, long taskId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _solutionServiceUri + $"api/Solutions/{groupId}/taskSolutions/{taskId}");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<Solution[]>();
        }

        public async Task<StatisticsCourseMatesDto[]> GetCourseStatistics(long courseId, string userId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _solutionServiceUri + $"api/Solutions/getCourseStat/{courseId}?userId={userId}");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<StatisticsCourseMatesDto[]>();
        }

        public async Task<Solution?[]> GetLastTaskSolutions(long[] taskIds, string userId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _solutionServiceUri + $"api/Solutions/taskSolutions/{userId}")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(taskIds),
                    Encoding.UTF8,
                    "application/json")
            };

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<Solution?[]>();
        }

        public async Task<SolutionPreviewDto[]> GetAllUnratedSolutionsForTasks(long[] taskIds)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _solutionServiceUri + "api/Solutions/allUnrated")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(taskIds),
                    Encoding.UTF8,
                    "application/json")
            };

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<SolutionPreviewDto[]>();
        }

        public async Task<bool> Ping()
        {
            try
            {
                await _httpClient.GetAsync(_solutionServiceUri + "api/system/ping");
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
