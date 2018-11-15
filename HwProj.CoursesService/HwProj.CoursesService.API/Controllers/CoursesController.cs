using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.API.Models;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CoursesService.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoursesController : Controller
    {
        private readonly ICourseRepository _repository;
        private readonly IMapper _mapper;

        public CoursesController(ICourseRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            return Json(_repository.Courses);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(long id)
        {
            var course = await _repository.GetAsync(id);
            return course == null
                ? NotFound() as IActionResult
                : Ok(course);
        }

        [HttpPost]
        public async Task<IActionResult> AddCourse([FromBody]CourseViewModel courseViewModel)
        {
            var course = _mapper.Map<Course>(courseViewModel);
            await _repository.AddAsync(course);

            return Ok(course);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourse(long id)
            => Result(await _repository.DeleteByIdAsync(id));

        [HttpPost("update/{courseId}")]
        public async Task<IActionResult> UpdateCourse(long courseId, [FromBody]CourseViewModel courseViewModel)
            => Result(await _repository.UpdateAsync(courseId, courseViewModel));

        [HttpPost("sign_in_course/{courseId}")]
        public async Task<IActionResult> SignInCourse(long courseId, [FromQuery]long? userId)
        {
            if (!userId.HasValue)
            {
                return NotFound();
            }

            return Result(await _repository.AddStudentAsync(courseId, userId.Value));
        }

        [HttpPost("accept_student/{courseId}")]
        public async Task<IActionResult> AcceptStudent(long courseId, [FromQuery]long? userId)
        {
            if (!userId.HasValue)
            {
                return NotFound();
            }

            return Result(await _repository.AcceptStudentAsync(courseId, userId.Value));
        }

        [HttpPost("reject_student/{courseId}")]
        public async Task<IActionResult> RejectStudent(long courseId, [FromQuery]long? userId)
        {
            if (!userId.HasValue)
            {
                return NotFound();
            }

            return Result(await _repository.RejectStudentAsync(courseId, userId.Value));
        }

        private IActionResult Result(bool flag)
            => flag
            ? Ok() as IActionResult
            : NotFound();

        #region временные методы для работы с юзерами

        [HttpPost("create_user")]
        public async Task<IActionResult> CreateUser([FromBody]User user)
        {
            await _repository.AddUserAsync(user);
            return Ok(user);
        }

        [HttpGet("users")]
        public IActionResult GetUsers()
        {
            return Json(_repository.Users);
        }

        [HttpGet("user/{id}")]
        public async Task<IActionResult> GetUser(long id)
        {
            var user = await _repository.GetUserAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            return Json(user);
        }

        #endregion
    }
}
