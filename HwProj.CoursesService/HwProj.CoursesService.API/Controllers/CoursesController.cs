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
            if (course == null)
            {
                return NotFound();
            }

            return Ok(course);
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
        {
            var deleted = await _repository.DeleteByIdAsync(id);
            if (!deleted)
            {
                return NotFound();
            }

            return Ok(deleted);
        }

        [HttpPost("update/{courseId}")]
        public async Task<IActionResult> UpdateCourse(long courseId, [FromBody]CourseViewModel courseViewModel)
        {
            var modified = await _repository.UpdateAsync(courseId, courseViewModel);
            if (!modified)
            {
                return NotFound();
            }

            return Ok(modified);
        }

        [HttpPost("sign_in_course/{courseId}")]
        public async Task<IActionResult> SignInCourse(long courseId, [FromQuery]long userId)
        {
            var added = await _repository.AddStudentAsync(courseId, userId);
            if (added)
            {
                return Ok(added);
            }

            return NotFound();
        }

        [HttpPost("accept_student/{courseId}")]
        public async Task<IActionResult> AcceptStudent(long courseId, [FromQuery]long userId)
        {
            var accepted = await _repository.AcceptStudentAsync(courseId, userId);
            if (accepted)
            {
                return Ok(accepted);
            }

            return NotFound();
        }

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
