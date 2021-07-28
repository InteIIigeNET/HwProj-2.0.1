using System;
using System.Diagnostics.Contracts;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using HwProj.HttpUtils;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
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
    }
}
