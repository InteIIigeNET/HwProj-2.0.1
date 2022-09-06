using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using HwProj.HttpUtils;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.Result;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

namespace HwProj.CoursesService.Client
{
    public class CoursesServiceClient : ICoursesServiceClient
    {
        private readonly HttpClient _httpClient;
        private readonly Uri _coursesServiceUri;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CoursesServiceClient(IHttpClientFactory clientFactory, IHttpContextAccessor httpContextAccessor,
            IConfiguration configuration)
        {
            _httpClient = clientFactory.CreateClient();
            _httpContextAccessor = httpContextAccessor;
            _coursesServiceUri = new Uri(configuration.GetSection("Services")["Courses"]);
        }

        public async Task<CoursePreview[]> GetAllCourses()
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + "api/Courses");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<CoursePreview[]>();
        }

        public async Task<CourseViewModel> GetCourseById(long courseId, string userId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + $"api/Courses/{courseId}")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(userId),
                    Encoding.UTF8,
                    "application/json")
            };
            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<CourseViewModel>();
        }

        public async Task<Result> DeleteCourse(long courseId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Delete,
                _coursesServiceUri + $"api/Courses/{courseId}");

            httpRequest.AddUserId(_httpContextAccessor);
            var response = await _httpClient.SendAsync(httpRequest);
            return response.IsSuccessStatusCode ? Result.Success() : Result.Failed(response.ReasonPhrase);
        }

        public async Task<long> CreateCourse(CreateCourseViewModel model, string mentorId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _coursesServiceUri + $"api/Courses/create?mentorId={mentorId}")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(model),
                    Encoding.UTF8,
                    "application/json")
            };

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<long>();
        }

        public async Task<Result> UpdateCourse(UpdateCourseViewModel model, long courseId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _coursesServiceUri + $"api/Courses/update/{courseId}")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(model),
                    Encoding.UTF8,
                    "application/json")
            };

            httpRequest.AddUserId(_httpContextAccessor);
            var response = await _httpClient.SendAsync(httpRequest);
            return response.IsSuccessStatusCode ? Result.Success() : Result.Failed(response.ReasonPhrase);
        }

        public async Task SignInCourse(long courseId, string studentId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _coursesServiceUri + $"api/Courses/signInCourse/{courseId}?studentId={studentId}");

            await _httpClient.SendAsync(httpRequest);
        }

        public async Task<Result> AcceptStudent(long courseId, string studentId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _coursesServiceUri + $"api/Courses/acceptStudent/{courseId}?studentId={studentId}");

            httpRequest.AddUserId(_httpContextAccessor);
            var response = await _httpClient.SendAsync(httpRequest);
            return response.IsSuccessStatusCode ? Result.Success() : Result.Failed(response.ReasonPhrase);
        }

        public async Task<Result> RejectStudent(long courseId, string studentId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _coursesServiceUri + $"api/Courses/rejectStudent/{courseId}?studentId={studentId}");

            httpRequest.AddUserId(_httpContextAccessor);
            var response = await _httpClient.SendAsync(httpRequest);
            return response.IsSuccessStatusCode ? Result.Success() : Result.Failed(response.ReasonPhrase);
        }

        public async Task<CoursePreview[]> GetAllUserCourses()
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + "api/Courses/userCourses");

            httpRequest.AddUserId(_httpContextAccessor);
            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<CoursePreview[]>();
        }

        public async Task<Result<long>> AddHomeworkToCourse(CreateHomeworkViewModel model, long courseId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _coursesServiceUri + $"api/Homeworks/{courseId}/add")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(model),
                    Encoding.UTF8,
                    "application/json")
            };

            httpRequest.AddUserId(_httpContextAccessor);

            var response = await _httpClient.SendAsync(httpRequest);
            return response.IsSuccessStatusCode
                ? Result<long>.Success(await response.DeserializeAsync<long>())
                : Result<long>.Failed(response.ReasonPhrase);
        }

        public async Task<HomeworkViewModel> GetHomework(long homeworkId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + $"api/Homeworks/get/{homeworkId}");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<HomeworkViewModel>();
        }

        public async Task<Result> UpdateHomework(CreateHomeworkViewModel model, long homeworkId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Put,
                _coursesServiceUri + $"api/Homeworks/update/{homeworkId}")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(model),
                    Encoding.UTF8,
                    "application/json")
            };

            httpRequest.AddUserId(_httpContextAccessor);
            var response = await _httpClient.SendAsync(httpRequest);
            return response.IsSuccessStatusCode ? Result.Success() : Result.Failed(response.ReasonPhrase);
        }

        public async Task<Result> DeleteHomework(long homeworkId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Delete,
                _coursesServiceUri + $"api/Homeworks/delete/{homeworkId}");

            httpRequest.AddUserId(_httpContextAccessor);
            var response = await _httpClient.SendAsync(httpRequest);
            return response.IsSuccessStatusCode ? Result.Success() : Result.Failed(response.ReasonPhrase);
        }

        public async Task<HomeworkTaskViewModel> GetTask(long taskId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + $"api/Tasks/get/{taskId}");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<HomeworkTaskViewModel>();
        }

        public async Task<Result<long>> AddTask(CreateTaskViewModel taskViewModel, long homeworkId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _coursesServiceUri + $"api/Tasks/{homeworkId}/add")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(taskViewModel),
                    Encoding.UTF8,
                    "application/json")
            };

            httpRequest.AddUserId(_httpContextAccessor);

            var response = await _httpClient.SendAsync(httpRequest);
            return response.IsSuccessStatusCode
                ? Result<long>.Success(await response.DeserializeAsync<long>())
                : Result<long>.Failed(response.ReasonPhrase);
        }

        public async Task<Result> DeleteTask(long taskId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Delete,
                _coursesServiceUri + $"api/Tasks/delete/{taskId}");

            httpRequest.AddUserId(_httpContextAccessor);
            var response = await _httpClient.SendAsync(httpRequest);
            return response.IsSuccessStatusCode ? Result.Success() : Result.Failed(response.ReasonPhrase);
        }

        public async Task<Result> UpdateTask(CreateTaskViewModel taskViewModel, long taskId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Put,
                _coursesServiceUri + $"api/Tasks/update/{taskId}")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(taskViewModel),
                    Encoding.UTF8,
                    "application/json")
            };

            httpRequest.AddUserId(_httpContextAccessor);
            var response = await _httpClient.SendAsync(httpRequest);
            return response.IsSuccessStatusCode ? Result.Success() : Result.Failed(response.ReasonPhrase);
        }

        public async Task<GroupViewModel[]> GetAllCourseGroups(long courseId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + $"api/CourseGroups/{courseId}/getAll");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<GroupViewModel[]>();
        }

        public async Task<long> CreateCourseGroup(CreateGroupViewModel model, long courseId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _coursesServiceUri + $"api/CourseGroups/{courseId}/create")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(model),
                    Encoding.UTF8,
                    "application/json")
            };

            httpRequest.AddUserId(_httpContextAccessor);

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<long>();
        }

        public async Task DeleteCourseGroup(long courseId, long groupId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Delete,
                _coursesServiceUri + $"api/CourseGroups/{courseId}/delete/{groupId}");

            httpRequest.AddUserId(_httpContextAccessor);

            await _httpClient.SendAsync(httpRequest);
        }

        public async Task UpdateCourseGroup(UpdateGroupViewModel model, long courseId, long groupId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _coursesServiceUri + $"api/CourseGroups/{courseId}/update/{groupId}")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(model),
                    Encoding.UTF8,
                    "application/json")
            };

            httpRequest.AddUserId(_httpContextAccessor);

            await _httpClient.SendAsync(httpRequest);
        }

        public async Task<GroupViewModel> GetCourseGroupsById(long courseId, string userId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + $"api/CourseGroups/{courseId}/get?userId={userId}");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<GroupViewModel>();
        }

        public async Task AddStudentInGroup(long courseId, long groupId, string userId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _coursesServiceUri + $"api/CourseGroups/{courseId}/addStudentInGroup/{groupId}?userId={userId}");

            httpRequest.AddUserId(_httpContextAccessor);

            await _httpClient.SendAsync(httpRequest);
        }

        public async Task RemoveStudentFromGroup(long courseId, long groupId, string userId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _coursesServiceUri + $"api/CourseGroups/{courseId}/removeStudentFromGroup/{groupId}?userId={userId}");

            httpRequest.AddUserId(_httpContextAccessor);

            await _httpClient.SendAsync(httpRequest);
        }

        public async Task<GroupViewModel> GetGroupById(long groupId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + $"api/CourseGroups/get/{groupId}");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<GroupViewModel>();
        }

        public async Task<long[]> GetGroupTasks(long groupId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + $"api/CourseGroups/getTasks/{groupId}");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<long[]>();
        }

        public async Task<Result> AcceptLecturer(long courseId, string lecturerEmail)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + $"api/Courses/acceptLecturer/{courseId}?lecturerEmail={lecturerEmail}");

            httpRequest.AddUserId(_httpContextAccessor);
            var response = await _httpClient.SendAsync(httpRequest);
            return response.IsSuccessStatusCode ? Result.Success() : Result.Failed(response.ReasonPhrase);
        }

        public async Task<Result<AccountDataDto[]>> GetLecturersAvailableForCourse(long courseId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + $"api/Courses/getLecturersAvailableForCourse/{courseId}");

            httpRequest.AddUserId(_httpContextAccessor);

            var response = await _httpClient.SendAsync(httpRequest);
            return response.IsSuccessStatusCode
                ? Result<AccountDataDto[]>.Success(await response.DeserializeAsync<AccountDataDto[]>())
                : Result<AccountDataDto[]>.Failed(response.ReasonPhrase);
        }
    }
}
