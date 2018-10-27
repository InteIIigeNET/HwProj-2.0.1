using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CoursesService.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoursesController : Controller
    {
        private readonly ICourseRepository _repository;

        public CoursesController(ICourseRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            return Json(_repository.Courses);
        }

        [HttpPost]
        public async Task<IActionResult> AddCourse([FromBody]CourseViewModel courseViewModel)
        {
            var course = new Course() { Name = courseViewModel.Name };
            await _repository.AddAsync(course);

            return Ok(courseViewModel);
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

        [HttpPost("modify/{courseId}")]
        public async Task<IActionResult> UpdateCourse(long courseId, [FromBody]CourseViewModel courseViewModel)
        {
            var modified = await _repository.UpdateAsync(courseId, courseViewModel);
            if (!modified)
            {
                return NotFound();
            }

            return Ok(modified);
        }
    }
}
