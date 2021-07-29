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
            var data = await response.DeserializeAsync<CourseViewModel[]>();
            return data;
        }
        
        public async Task<CourseViewModel> GetCourseData(long courseId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + $"api/Courses/{courseId}");

            var response = await _httpClient.SendAsync(httpRequest);
            var data = await response.DeserializeAsync<CourseViewModel>();
            return data;
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
            var data = await response.DeserializeAsync<long>();
            return data;
        }
        
        public async Task UpdateCourse(CourseViewModel model, long courseId)
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

        public async Task SignInCourse(long courseId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _coursesServiceUri + $"api/Courses/sign_in_course/{courseId}");
            
            await _httpClient.SendAsync(httpRequest);
        }
        
        public async Task AcceptStudent(long courseId, string studentId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _coursesServiceUri + $"api/Courses/accept_student/{courseId}?studentId={studentId}");
            
            await _httpClient.SendAsync(httpRequest);
        }
        
        public async Task RejectStudent(long courseId, string studentId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _coursesServiceUri + $"api/Courses/reject_student/{courseId}?studentId={studentId}");
            
            await _httpClient.SendAsync(httpRequest);
        }

        public async Task<CourseViewModel[]> GetAllUserCourses(string userId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get, 
                _coursesServiceUri + $"api/Courses/user_courses/{userId}");

            var response = await _httpClient.SendAsync(httpRequest);
            var data = await response.DeserializeAsync<CourseViewModel[]>();
            return data;
        }
    }
}
