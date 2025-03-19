using System;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using HwProj.Exceptions;
using HwProj.HttpUtils;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.CoursesService;
using HwProj.Models.CoursesService.DTO;
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

        public async Task<CourseDTO?> GetCourseByTask(long taskId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + $"api/Courses/getByTask/{taskId}");

            httpRequest.TryAddUserId(_httpContextAccessor);
            var response = await _httpClient.SendAsync(httpRequest);
            return response.IsSuccessStatusCode ? await response.DeserializeAsync<CourseDTO>() : null;
        }

        public async Task<CourseDTO?> GetCourseById(long courseId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + $"api/Courses/{courseId}");

            httpRequest.TryAddUserId(_httpContextAccessor);
            var response = await _httpClient.SendAsync(httpRequest);
            return response.IsSuccessStatusCode ? await response.DeserializeAsync<CourseDTO>() : null;
        }

        public async Task<Result<CourseDTO>> GetCourseByIdForMentor(long courseId, string mentorId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + $"api/Courses/getForMentor/{courseId}/{mentorId}");

            httpRequest.TryAddUserId(_httpContextAccessor);
            var response = await _httpClient.SendAsync(httpRequest);

            return response.StatusCode switch
            {
                HttpStatusCode.OK => Result<CourseDTO>.Success(await response.DeserializeAsync<CourseDTO>()),
                HttpStatusCode.Forbidden => Result<CourseDTO>.Failed(await response.Content.ReadAsStringAsync()),
                _ => Result<CourseDTO>.Failed()
            };
        }

        public async Task<Result<CourseDTO>> GetAllCourseData(long courseId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + $"api/Courses/getAllData/{courseId}");

            httpRequest.TryAddUserId(_httpContextAccessor);
            var response = await _httpClient.SendAsync(httpRequest);

            return response.StatusCode switch
            {
                HttpStatusCode.OK => Result<CourseDTO>.Success(await response.DeserializeAsync<CourseDTO>()),
                HttpStatusCode.Forbidden => Result<CourseDTO>.Failed(await response.Content.ReadAsStringAsync()),
                _ => Result<CourseDTO>.Failed()
            };
        }

        public async Task<Result> DeleteCourse(long courseId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Delete,
                _coursesServiceUri + $"api/Courses/{courseId}");

            httpRequest.TryAddUserId(_httpContextAccessor);
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

        public async Task<Result<long>> CreateCourseBasedOn(long courseId,
            CreateCourseViewModel model,
            string mentorId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _coursesServiceUri + $"api/Courses/createBasedOn/{courseId}?mentorId={mentorId}")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(model),
                    Encoding.UTF8,
                    "application/json")
            };

            httpRequest.TryAddUserId(_httpContextAccessor);
            var response = await _httpClient.SendAsync(httpRequest);
            return response.StatusCode switch
            {
                HttpStatusCode.OK => Result<long>.Success(await response.DeserializeAsync<long>()),
                _ => Result<long>.Failed(response.ReasonPhrase),
            };
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

            httpRequest.TryAddUserId(_httpContextAccessor);
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

            httpRequest.TryAddUserId(_httpContextAccessor);
            var response = await _httpClient.SendAsync(httpRequest);
            return response.IsSuccessStatusCode ? Result.Success() : Result.Failed(response.ReasonPhrase);
        }

        public async Task<Result> RejectStudent(long courseId, string studentId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _coursesServiceUri + $"api/Courses/rejectStudent/{courseId}?studentId={studentId}");

            httpRequest.TryAddUserId(_httpContextAccessor);
            var response = await _httpClient.SendAsync(httpRequest);
            return response.IsSuccessStatusCode ? Result.Success() : Result.Failed(response.ReasonPhrase);
        }

        public async Task<CourseDTO[]> GetAllUserCourses()
        {
            var role = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.Role).Value;
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + $"api/Courses/userCourses?role={role}");

            httpRequest.TryAddUserId(_httpContextAccessor);
            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<CourseDTO[]>();
        }

        public async Task<TaskDeadlineDto[]> GetTaskDeadlines()
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + "api/Courses/taskDeadlines");

            httpRequest.TryAddUserId(_httpContextAccessor);
            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<TaskDeadlineDto[]>();
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

            httpRequest.TryAddUserId(_httpContextAccessor);

            // TODO: check version of switch expression appearing
            var response = await _httpClient.SendAsync(httpRequest);
            return response.StatusCode switch
            {
                HttpStatusCode.Forbidden => Result<long>.Failed(),
                HttpStatusCode.OK => Result<long>.Success(await response.DeserializeAsync<long>()),
                HttpStatusCode.BadRequest => Result<long>.Failed(await response.DeserializeAsync<string[]>()),
                _ => Result<long>.Failed(),
            };
        }

        public async Task<HomeworkViewModel> GetHomework(long homeworkId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + $"api/Homeworks/get/{homeworkId}");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<HomeworkViewModel>();
        }

        public async Task<HomeworkViewModel> GetForEditingHomework(long homeworkId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + $"api/Homeworks/getForEditing/{homeworkId}");

            httpRequest.TryAddUserId(_httpContextAccessor);

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<HomeworkViewModel>();
        }

        public async Task<Result<HomeworkViewModel>> UpdateHomework(long homeworkId, CreateHomeworkViewModel model)
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

            httpRequest.TryAddUserId(_httpContextAccessor);
            var response = await _httpClient.SendAsync(httpRequest);
            return response.StatusCode switch
            {
                HttpStatusCode.Forbidden => throw new ForbiddenException(),
                HttpStatusCode.OK => Result<HomeworkViewModel>.Success(
                    await response.DeserializeAsync<HomeworkViewModel>()
                ),
                HttpStatusCode.BadRequest => Result<HomeworkViewModel>.Failed(
                    await response.DeserializeAsync<string[]>()
                ),
                _ => Result<HomeworkViewModel>.Failed(),
            };
        }

        public async Task<Result> DeleteHomework(long homeworkId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Delete,
                _coursesServiceUri + $"api/Homeworks/delete/{homeworkId}");

            httpRequest.TryAddUserId(_httpContextAccessor);
            var response = await _httpClient.SendAsync(httpRequest);
            return response.IsSuccessStatusCode ? Result.Success() : Result.Failed(response.ReasonPhrase);
        }

        public async Task<HomeworkTaskViewModel> GetTask(long taskId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + $"api/Tasks/get/{taskId}");

            httpRequest.TryAddUserId(_httpContextAccessor);

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<HomeworkTaskViewModel>();
        }

        public async Task<HomeworkTaskForEditingViewModel> GetForEditingTask(long taskId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + $"api/Tasks/getForEditing/{taskId}");

            httpRequest.TryAddUserId(_httpContextAccessor);

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<HomeworkTaskForEditingViewModel>();
        }

        public async Task<Result<long>> AddTask(long homeworkId, CreateTaskViewModel taskViewModel)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _coursesServiceUri + $"api/Tasks/add/{homeworkId}")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(taskViewModel),
                    Encoding.UTF8,
                    "application/json")
            };

            httpRequest.TryAddUserId(_httpContextAccessor);

            var response = await _httpClient.SendAsync(httpRequest);
            return response.StatusCode switch
            {
                HttpStatusCode.Forbidden => Result<long>.Failed(),
                HttpStatusCode.OK => Result<long>.Success(await response.DeserializeAsync<long>()),
                HttpStatusCode.BadRequest => Result<long>.Failed(await response.DeserializeAsync<string[]>()),
                _ => Result<long>.Failed(),
            };
        }

        public async Task<Result> DeleteTask(long taskId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Delete,
                _coursesServiceUri + $"api/Tasks/delete/{taskId}");

            httpRequest.TryAddUserId(_httpContextAccessor);
            var response = await _httpClient.SendAsync(httpRequest);
            return response.IsSuccessStatusCode ? Result.Success() : Result.Failed(response.ReasonPhrase);
        }

        public async Task<Result<HomeworkTaskViewModel>> UpdateTask(long taskId, CreateTaskViewModel taskViewModel)
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

            httpRequest.TryAddUserId(_httpContextAccessor);
            var response = await _httpClient.SendAsync(httpRequest);
            return response.StatusCode switch
            {
                HttpStatusCode.Forbidden => throw new ForbiddenException(),
                HttpStatusCode.OK => Result<HomeworkTaskViewModel>.Success(
                    await response.DeserializeAsync<HomeworkTaskViewModel>()
                ),
                HttpStatusCode.BadRequest => Result<HomeworkTaskViewModel>.Failed(
                    await response.DeserializeAsync<string[]>()
                ),
                _ => Result<HomeworkTaskViewModel>.Failed(),
            };
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

            httpRequest.TryAddUserId(_httpContextAccessor);

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<long>();
        }

        public async Task DeleteCourseGroup(long courseId, long groupId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Delete,
                _coursesServiceUri + $"api/CourseGroups/{courseId}/delete/{groupId}");

            httpRequest.TryAddUserId(_httpContextAccessor);

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

            httpRequest.TryAddUserId(_httpContextAccessor);

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

            httpRequest.TryAddUserId(_httpContextAccessor);

            await _httpClient.SendAsync(httpRequest);
        }

        public async Task RemoveStudentFromGroup(long courseId, long groupId, string userId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _coursesServiceUri + $"api/CourseGroups/{courseId}/removeStudentFromGroup/{groupId}?userId={userId}");

            httpRequest.TryAddUserId(_httpContextAccessor);

            await _httpClient.SendAsync(httpRequest);
        }

        public async Task<GroupViewModel[]> GetGroupsById(params long[] groupIds)
        {
            if (groupIds.Length == 0) return Array.Empty<GroupViewModel>();

            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + "api/CourseGroups")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(groupIds),
                    Encoding.UTF8,
                    "application/json")
            };

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<GroupViewModel[]>();
        }

        public async Task<long[]> GetGroupTasks(long groupId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + $"api/CourseGroups/getTasks/{groupId}");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<long[]>();
        }

        public async Task<Result> AcceptLecturer(long courseId, string lecturerEmail, string lecturerId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri +
                $"api/Courses/acceptLecturer/{courseId}?lecturerEmail={lecturerEmail}&lecturerId={lecturerId}");

            httpRequest.TryAddUserId(_httpContextAccessor);
            var response = await _httpClient.SendAsync(httpRequest);
            return response.IsSuccessStatusCode
                ? Result.Success()
                : Result.Failed(response.ReasonPhrase);
        }

        public async Task<Result<AccountDataDto[]>> GetLecturersAvailableForCourse(long courseId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + $"api/Courses/getLecturersAvailableForCourse/{courseId}");

            httpRequest.TryAddUserId(_httpContextAccessor);

            var response = await _httpClient.SendAsync(httpRequest);
            return response.IsSuccessStatusCode
                ? Result<AccountDataDto[]>.Success(await response.DeserializeAsync<AccountDataDto[]>())
                : Result<AccountDataDto[]>.Failed(response.ReasonPhrase);
        }

        public async Task<string[]> GetCourseLecturersIds(long courseId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + $"api/Courses/getCourseLecturers/{courseId}");
            httpRequest.TryAddUserId(_httpContextAccessor);

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<string[]>();
        }

        public async Task<Result<string[]>> GetAllTagsForCourse(long courseId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + $"api/Courses/getAllTagsForCourse/{courseId}");

            var response = await _httpClient.SendAsync(httpRequest);

            return response.IsSuccessStatusCode
                ? Result<string[]>.Success(await response.DeserializeAsync<string[]>())
                : Result<string[]>.Failed();
        }

        public async Task<Result<long>> CreateOrUpdateCourseFilter(long courseId, CreateCourseFilterDTO model)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _coursesServiceUri + $"api/CourseFilters/{courseId}/create");
            httpRequest.Content = new StringContent(
                JsonConvert.SerializeObject(model),
                Encoding.UTF8,
                "application/json");

            httpRequest.TryAddUserId(_httpContextAccessor);
            var response = await _httpClient.SendAsync(httpRequest);

            return response.StatusCode switch
            {
                HttpStatusCode.OK => Result<long>.Success(await response.DeserializeAsync<long>()),
                HttpStatusCode.BadRequest => Result<long>.Failed(await response.Content.ReadAsStringAsync()),
                _ => Result<long>.Failed(),
            };
        }

        public async Task AddQuestionForTask(AddTaskQuestionDto question)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _coursesServiceUri + "api/Tasks/addQuestion");
            httpRequest.Content = new StringContent(
                JsonConvert.SerializeObject(question),
                Encoding.UTF8,
                "application/json");

            httpRequest.TryAddUserId(_httpContextAccessor);
            await _httpClient.SendAsync(httpRequest);
        }

        public async Task<GetTaskQuestionDto[]> GetQuestionsForTask(long taskId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + $"api/Tasks/questions/{taskId}");

            httpRequest.TryAddUserId(_httpContextAccessor);
            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<GetTaskQuestionDto[]>();
        }

        public async Task AddAnswerForQuestion(AddAnswerForQuestionDto answer)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _coursesServiceUri + "api/Tasks/addAnswer");
            httpRequest.Content = new StringContent(
                JsonConvert.SerializeObject(answer),
                Encoding.UTF8,
                "application/json");

            httpRequest.TryAddUserId(_httpContextAccessor);
            await _httpClient.SendAsync(httpRequest);
        }

        public async Task<MentorToAssignedStudentsDTO[]> GetMentorsToAssignedStudents(long courseId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _coursesServiceUri + $"api/Courses/getMentorsToStudents/{courseId}");

            httpRequest.TryAddUserId(_httpContextAccessor);
            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<MentorToAssignedStudentsDTO[]>();
        }

        public async Task<bool> Ping()
        {
            try
            {
                await _httpClient.GetAsync(_coursesServiceUri + "api/system/ping");
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
