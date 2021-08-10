using System;
using System.Diagnostics.Contracts;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using HwProj.HttpUtils;
using HwProj.Models.CoursesService.DTO;
using HwProj.Models.CoursesService.ViewModels;
using Newtonsoft.Json;

namespace HwProj.CoursesService.Client
{
    public class CoursesServiceClient : ICoursesServiceClient
    {
        private readonly HttpClient _httpClient;
        private readonly Uri _coursesServiceUri;

        public CoursesServiceClient(HttpClient httpClient, Uri coursesServiceUri)
        {
            _httpClient = httpClient;
            _coursesServiceUri = coursesServiceUri;
        }

        public async Task<CourseViewModel[]> GetAllCourses()
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get, 
                _coursesServiceUri + "api/Courses");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<CourseViewModel[]>();
        }
        
        public async Task<CourseViewModel> GetCourseById(long courseId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + $"api/Courses/{courseId}");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<CourseViewModel>();
        }
        
        public async Task DeleteCourse(long courseId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Delete,
                _coursesServiceUri + $"api/Courses/{courseId}");
            
            await _httpClient.SendAsync(httpRequest);
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
            return await response.DeserializeAsync<long>();;
        }
        
        public async Task UpdateCourse(UpdateCourseViewModel model, long courseId)
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
            
            await _httpClient.SendAsync(httpRequest);
        }

        public async Task SignInCourse(long courseId, string studentId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _coursesServiceUri + $"api/Courses/signInCourse/{courseId}?studentId={studentId}");
            
            await _httpClient.SendAsync(httpRequest);
        }
        
        public async Task AcceptStudent(long courseId, string studentId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _coursesServiceUri + $"api/Courses/acceptStudent/{courseId}?studentId={studentId}");
            
            await _httpClient.SendAsync(httpRequest);
        }
        
        public async Task RejectStudent(long courseId, string studentId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _coursesServiceUri + $"api/Courses/rejectStudent/{courseId}?studentId={studentId}");
            
            await _httpClient.SendAsync(httpRequest);
        }

        public async Task<UserCourseDescription[]> GetAllUserCourses(string userId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get, 
                _coursesServiceUri + $"api/Courses/userCourses/{userId}");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<UserCourseDescription[]>();
        }

        public async Task<long> AddHomeworkToCourse(CreateHomeworkViewModel model, long courseId)
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

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<long>();
        }

        public async Task<HomeworkViewModel> GetHomework(long homeworkId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + $"api/Homeworks/get/{homeworkId}");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<HomeworkViewModel>();
        }

        public async Task UpdateHomework(CreateHomeworkViewModel model, long homeworkId)
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
            
            await _httpClient.SendAsync(httpRequest);
        }

        public async Task DeleteHomework(long homeworkId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Delete,
                _coursesServiceUri + $"api/Homeworks/delete/{homeworkId}");
            
            await _httpClient.SendAsync(httpRequest);
        }

        public async Task<HomeworkTaskViewModel> GetTask(long taskId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get, 
                _coursesServiceUri + $"api/Tasks/get/{taskId}");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<HomeworkTaskViewModel>();
        }

        public async Task<long> AddTask(CreateTaskViewModel taskViewModel, long homeworkId)
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
            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<long>();
        }

        public async Task DeleteTask(long taskId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Delete,
                _coursesServiceUri + $"api/Tasks/delete/{taskId}");
            
            await _httpClient.SendAsync(httpRequest);
        }
        
        public async Task UpdateTask(CreateTaskViewModel taskViewModel, long taskId)
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
            await _httpClient.SendAsync(httpRequest);
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

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<long>();;
        }
        
        public async Task DeleteCourseGroup(long courseId, long groupId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Delete,
                _coursesServiceUri + $"api/CourseGroups/{courseId}/delete/{groupId}");
            
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
            
            await _httpClient.SendAsync(httpRequest);
        }
        
        public async Task RemoveStudentFromGroup(long courseId, long groupId, string userId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _coursesServiceUri + $"api/CourseGroups/{courseId}/removeStudentFromGroup/{groupId}?userId={userId}");
            
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
    }
}
