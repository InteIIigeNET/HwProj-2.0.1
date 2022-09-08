using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Models;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.CoursesService.ViewModels;
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
        private readonly IAuthServiceClient _authServiceClient;

        public CoursesController(ICoursesServiceClient coursesClient, IAuthServiceClient authServiceClient)
        {
            _coursesClient = coursesClient;
            _authServiceClient = authServiceClient;
        }

        [HttpGet]
        [Authorize]
        public async Task<CoursePreviewView[]> GetAllCourses()
        {
            var courses = await _coursesClient.GetAllCourses();
            var result = await GetCoursePreviews(courses);
            return result;
        }

        [HttpGet("{courseId}")]
        [ProducesResponseType(typeof(CourseViewModel), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCourseData(long courseId)
        {
            var course = await _coursesClient.GetCourseById(courseId, UserId);
            if (course == null) return NotFound();

            var studentIds = course.CourseMates.Select(t => t.StudentId).ToArray();
            var getStudentsTask = _authServiceClient.GetAccountsData(studentIds);
            var getMentorsTask = _authServiceClient.GetAccountsData(course.MentorIds);

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

            var result = new CourseViewModel
            {
                Id = courseId,
                Name = course.Name,
                GroupName = course.GroupName,
                Mentors = getMentorsTask.Result.Where(t => t != null).ToArray(),
                AcceptedStudents = acceptedStudents.ToArray(),
                NewStudents = newStudents.ToArray(),
                Homeworks = course.Homeworks,
                IsCompleted = course.IsCompleted,
                IsOpen = course.IsOpen,
            };

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

        [HttpPost("update/{courseId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> UpdateCourse(UpdateCourseViewModel model, long courseId)
        {
            await _coursesClient.UpdateCourse(model, courseId);
            return Ok();
        }

        [HttpPost("signInCourse/{courseId}")]
        [Authorize]
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
            await _coursesClient.AcceptLecturer(courseId, lecturerEmail);
            return Ok();
        }

        [HttpGet("getLecturersAvailableForCourse/{courseId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(AccountDataDto[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetLecturersAvailableForCourse(long courseId)
        {
            var result = await _coursesClient.GetLecturersAvailableForCourse(courseId);
            return Ok(result.Value);
        }

        private async Task<CoursePreviewView[]> GetCoursePreviews(CoursePreview[] courses)
        {
            var getMentorsTasks = courses.Select(t => _authServiceClient.GetAccountsData(t.MentorIds)).ToList();
            await Task.WhenAll(getMentorsTasks);
            var mentorDTOs = getMentorsTasks.Select(t => t.Result);

            var result = courses.Zip(mentorDTOs, (course, mentors) =>
                new CoursePreviewView
                {
                    Id = course.Id,
                    Name = course.Name,
                    GroupName = course.GroupName,
                    IsCompleted = course.IsCompleted,
                    Mentors = mentors.Where(t => t != null).ToArray()
                }).ToArray();

            return result;
        }
    }
}
