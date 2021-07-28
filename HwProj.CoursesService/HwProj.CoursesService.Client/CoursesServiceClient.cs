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
        private readonly Uri _authServiceUri;

        public CoursesServiceClient(HttpClient httpClient, Uri authServiceUri)
        {
            _httpClient = httpClient;
            _authServiceUri = authServiceUri;
        }

        public async Task<CourseViewModel[]> GetAllCourses()
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get, 
                _authServiceUri + "api/Courses");

            var response = await _httpClient.SendAsync(httpRequest);
            var data = await response.DeserializeAsync<CourseViewModel[]>();
            return data;
        }
    }
}
