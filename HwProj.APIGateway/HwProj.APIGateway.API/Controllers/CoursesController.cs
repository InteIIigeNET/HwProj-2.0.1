using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.APIGateway.API.Models;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.CoursesService.DTO;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.Result;
using HwProj.Models.Roles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CoursesController : AggregationController
    {
        private readonly ICoursesServiceClient _coursesClient;
        private readonly IMapper _mapper;

        public CoursesController(ICoursesServiceClient coursesClient,
            IAuthServiceClient authServiceClient,
            IMapper mapper) : base(authServiceClient)
        {
            _coursesClient = coursesClient;
            _mapper = mapper;
        }

        [HttpGet]
        [Authorize]
        public async Task<CoursePreviewView[]> GetAllCourses()
        {
            var courses = await _coursesClient.GetAllCourses();
            var result = await GetCoursePreviews(courses);
            return result;
        }

        [HttpGet("getAllData/{courseId}")]
        [ProducesResponseType(typeof(CourseViewModel), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAllCourseData(long courseId)
        {
            var courseResult = await _coursesClient.GetAllCourseData(courseId);
            if (!courseResult.Succeeded)
                return BadRequest(courseResult.Errors[0]);

            var result = await ToCourseViewModel(courseResult.Value);
            return Ok(result);
        }

        [HttpGet("{courseId}")]
        [ProducesResponseType(typeof(CourseViewModel), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCourseData(long courseId)
        {
            var course = await _coursesClient.GetCourseById(courseId);
            if (course == null) return NotFound();

            var result = await ToCourseViewModel(course);
            return Ok(result);
        }

        [HttpDelete("{courseId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> DeleteCourse(long courseId)
        {
            await _coursesClient.DeleteCourse(courseId);
            return Ok();
        }

        [HttpPost("create")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> CreateCourse(CreateCourseViewModel model)
        {
            var result = await _coursesClient.CreateCourse(model, UserId);
            return Ok(result);
        }

        [HttpPost("createBasedOn/{courseId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> CreateCourseBasedOn(long courseId, CreateCourseViewModel model)
        {
            var result = await _coursesClient.CreateCourseBasedOn(courseId, model, UserId);
            return result.Succeeded
                ? Ok(result.Value) as IActionResult
                : BadRequest(result.Errors);
        }

        [HttpPost("update/{courseId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> UpdateCourse(UpdateCourseViewModel model, long courseId)
        {
            await _coursesClient.UpdateCourse(model, courseId);
            return Ok();
        }

        [HttpPost("signInCourse/{courseId}")]
        [Authorize(Roles = Roles.StudentRole)]
        public async Task<IActionResult> SignInCourse(long courseId)
        {
            await _coursesClient.SignInCourse(courseId, UserId);
            return Ok();
        }

        [HttpPost("acceptStudent/{courseId}/{studentId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> AcceptStudent(long courseId, string studentId)
        {
            await _coursesClient.AcceptStudent(courseId, studentId);
            return Ok();
        }

        [HttpPost("rejectStudent/{courseId}/{studentId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> RejectStudent(long courseId, string studentId)
        {
            await _coursesClient.RejectStudent(courseId, studentId);
            return Ok();
        }

        [HttpGet("userCourses")]
        [Authorize]
        public async Task<CoursePreviewView[]> GetAllUserCourses()
        {
            var userCourses = await _coursesClient.GetAllUserCourses();
            var result = await GetCoursePreviews(userCourses);
            return result;
        }

        [HttpGet("acceptLecturer/{courseId}/{lecturerEmail}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> AcceptLecturer(long courseId, string lecturerEmail)
        {
            var lecturer = await AuthServiceClient.GetAccountDataByEmail(lecturerEmail);
            if (lecturer == null) return NotFound("Преподаватель с такой почтой не найден");
            if (lecturer.Role != Roles.LecturerRole && lecturer.Role != Roles.ExpertRole) 
                return BadRequest("Пользователь не является преподавателем");

            var result = await _coursesClient.AcceptLecturer(courseId, lecturerEmail, lecturer.UserId);
            return result.Succeeded
                ? Ok(result) as IActionResult
                : BadRequest(result.Errors);
        }

        [HttpGet("getLecturersAvailableForCourse/{courseId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(AccountDataDto[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetLecturersAvailableForCourse(long courseId)
        {
            var result = await _coursesClient.GetLecturersAvailableForCourse(courseId);
            return Ok(result.Value);
        }

        [HttpGet("tags/{courseId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(string[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAllTagsForCourse(long courseId)
        {
            var result = await _coursesClient.GetAllTagsForCourse(courseId);
            return result.Succeeded
                ? Ok(result.Value) as IActionResult
                : BadRequest(result.Errors);
        }

        [HttpPost("editMentorWorkspace/{courseId}/{mentorId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> EditMentorWorkspace(
            long courseId, string mentorId, EditMentorWorkspaceDTO editMentorWorkspaceDto)
        {
            var mentor = await AuthServiceClient.GetAccountData(mentorId);
            if (mentor == null)
                return NotFound("Пользователь с такой почтой не найден");

            if (!Roles.LecturerOrExpertRole.Contains(mentor.Role))
                return BadRequest("Пользователь с такой почтой не является преподавателем или экспертом");

            var courseFilterModel = _mapper.Map<CreateCourseFilterDTO>(editMentorWorkspaceDto);
            courseFilterModel.UserId = mentorId;

            var courseFilterCreationResult =
                await _coursesClient.CreateOrUpdateCourseFilter(courseId, courseFilterModel);

            return courseFilterCreationResult.Succeeded
                ? Ok() as IActionResult
                : BadRequest(courseFilterCreationResult.Errors[0]);
        }

        [HttpGet("getMentorWorkspace/{courseId}/{mentorId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(WorkspaceViewModel), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetMentorWorkspace(long courseId, string mentorId)
        {
            var mentor = await AuthServiceClient.GetAccountData(mentorId);
            if (mentor == null)
                return NotFound("Пользователь с такой почтой не найден");

            if (!Roles.LecturerOrExpertRole.Contains(mentor.Role))
                return BadRequest("Пользователь с такой почтой не является преподавателем или экспертом");

            var mentorCourseView = await _coursesClient.GetCourseByIdForMentor(courseId, mentorId);
            if (!mentorCourseView.Succeeded)
                return BadRequest(mentorCourseView.Errors[0]);

            var studentIds = mentorCourseView.Value.CourseMates.Select(t => t.StudentId).ToArray();
            var students = await AuthServiceClient.GetAccountsData(studentIds);
            
            var workspace = new WorkspaceViewModel
            {
                Homeworks = mentorCourseView.Value.Homeworks,
                Students = students
            };
            return Ok(workspace);
        }

        private async Task<CourseViewModel> ToCourseViewModel(CourseDTO course)
        {
            var studentIds = course.CourseMates.Select(t => t.StudentId).ToArray();
            var getStudentsTask = AuthServiceClient.GetAccountsData(studentIds);
            var getMentorsTask = AuthServiceClient.GetAccountsData(course.MentorIds);

            await Task.WhenAll(getStudentsTask, getMentorsTask);

            var students = getStudentsTask.Result;

            var acceptedStudents = new List<AccountDataDto>();
            var newStudents = new List<AccountDataDto>();
            for (var i = 0; i < students.Length; i++)
            {
                if (!(students[i] is { } student)) continue;
                if (course.CourseMates[i].IsAccepted) acceptedStudents.Add(student);
                else newStudents.Add(student);
            }

            return new CourseViewModel
            {
                Id = course.Id,
                Name = course.Name,
                GroupName = course.GroupName,
                Mentors = getMentorsTask.Result.Where(t => t != null).ToArray(),
                AcceptedStudents = acceptedStudents.ToArray(),
                NewStudents = newStudents.ToArray(),
                Homeworks = course.Homeworks,
                IsCompleted = course.IsCompleted,
                IsOpen = course.IsOpen,
            };
        }
    }
}