using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Models.Repositories;
using HwProj.CoursesService.API.Models.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CoursesService.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoursesController : Controller
    {
        private readonly ICourseRepository _courseRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public CoursesController(ICourseRepository courseRepository, IUserRepository userRepository, IMapper mapper)
        {
            _courseRepository = courseRepository;
            _userRepository = userRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public IActionResult GetAll()
            => Json(_courseRepository.GetAll().Select(c => CourseViewModel.FromCourse(c, _mapper)));

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(long id)
        {
            var course = await _courseRepository.GetAsync(id);
            return course == null
                ? NotFound() as IActionResult
                : Json(CourseViewModel.FromCourse(course, _mapper));
        }

        [HttpPost]
        public async Task<IActionResult> AddCourse([FromBody]CreateCourseViewModel courseViewModel, [FromQuery]string mentorId)
        {
            if (string.IsNullOrEmpty(mentorId))
            {
                return NotFound();
            }

            var mentor = await _userRepository.GetAsync(mentorId) ?? new User() { Id = mentorId };
            var course = _mapper.Map<Course>(courseViewModel);
            course.Mentor = mentor;
            await _courseRepository.AddAsync(course);

            return Ok(CourseViewModel.FromCourse(course, _mapper));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourse(long id)
            => Result(await _courseRepository.DeleteByIdAsync(id));

        [HttpPost("update/{courseId}")]
        public async Task<IActionResult> UpdateCourse(long courseId, [FromBody]UpdateCourseViewModel courseViewModel)
            => Result(await _courseRepository.UpdateAsync(courseId, courseViewModel));

        [HttpPost("sign_in_course/{courseId}")]
        public async Task<IActionResult> SignInCourse(long courseId, [FromQuery]string userId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                return NotFound();
            }

            var student = await _userRepository.GetAsync(userId) ?? new User() { Id = userId };
            return Result(await _courseRepository.AddStudentAsync(courseId, student));
        }

        [HttpPost("accept_student/{courseId}")]
        public async Task<IActionResult> AcceptStudent(long courseId, [FromQuery]string userId)
            => string.IsNullOrEmpty(userId)
                ? NotFound() as IActionResult
                : Result(await _courseRepository.AcceptStudentAsync(courseId, await _userRepository.GetAsync(userId)));

        [HttpPost("reject_student/{courseId}")]
        public async Task<IActionResult> RejectStudent(long courseId, [FromQuery]string userId)
            => string.IsNullOrEmpty(userId)
                ? NotFound() as IActionResult
                : Result(await _courseRepository.RejectStudentAsync(courseId, await _userRepository.GetAsync(userId)));

        private IActionResult Result(bool flag)
            => flag
                ? Ok() as IActionResult
                : NotFound();

        #region временные методы для работы с юзерами

        [HttpPost("create_user")]
        public async Task<IActionResult> CreateUser([FromBody]User user)
        {
            await _userRepository.AddAsync(user);
            return Ok(user);
        }

        [HttpGet("users")]
        public IActionResult GetUsers()
        {
            return Json(_userRepository.GetAll());
        }

        [HttpGet("user/{id}")]
        public async Task<IActionResult> GetUser(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return NotFound();
            }

            var user = await _userRepository.GetAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            return Json(user);
        }

        #endregion
    }
}
