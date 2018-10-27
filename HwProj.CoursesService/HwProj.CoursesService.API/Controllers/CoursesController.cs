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
    }
}
