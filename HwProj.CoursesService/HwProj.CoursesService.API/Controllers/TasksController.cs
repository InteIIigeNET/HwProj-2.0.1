using System;
using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Domains;
using HwProj.CoursesService.API.Filters;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.CoursesService.API.Services;
using HwProj.Models;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : Controller
    {
        private readonly ITasksService _tasksService;
        private readonly IHomeworksService _homeworksService;
        private readonly ITaskQuestionsRepository _questionsRepository;
        private readonly ICoursesService _coursesService;

        public TasksController(ITasksService tasksService, ICoursesService coursesService,
            IHomeworksService homeworksService, ITaskQuestionsRepository questionsRepository)
        {
            _tasksService = tasksService;
            _coursesService = coursesService;
            _homeworksService = homeworksService;
            _questionsRepository = questionsRepository;
        }

        [HttpGet("get/{taskId}")]
        public async Task<IActionResult> GetTask(long taskId)
        {
            var taskFromDb = await _tasksService.GetTaskAsync(taskId);
            if (taskFromDb == null) return NotFound();

            if (taskFromDb.PublicationDate > DateTime.UtcNow)
            {
                var userId = Request.GetUserIdFromHeader();
                var homework = taskFromDb.Homework;
                var lecturers = await _coursesService.GetCourseLecturers(homework.CourseId);
                if (!lecturers.Contains(userId)) return BadRequest();
            }

            var task = taskFromDb.ToHomeworkTaskViewModel();
            return Ok(task);
        }

        [HttpGet("getForEditing/{taskId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> GetForEditingTask(long taskId)
        {
            var taskFromDb = await _tasksService.GetForEditingTaskAsync(taskId);

            if (taskFromDb == null)
            {
                return NotFound();
            }

            var task = taskFromDb.ToHomeworkTaskForEditingViewModel();
            return Ok(task);
        }

        [HttpPost("add/{homeworkId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> AddTask(long homeworkId, [FromBody] CreateTaskViewModel taskViewModel)
        {
            var homework = await _homeworksService.GetHomeworkAsync(homeworkId);
            var validationResult = Validator.ValidateTask(taskViewModel, homework);
            if (validationResult.Any()) return BadRequest(validationResult);

            var taskId = await _tasksService.AddTaskAsync(homeworkId, taskViewModel.ToHomeworkTask());

            return Ok(taskId);
        }

        [HttpDelete("delete/{taskId}")] //bug with rights
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task DeleteTask(long taskId)
        {
            await _tasksService.DeleteTaskAsync(taskId);
        }

        [HttpPut("update/{taskId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> UpdateTask(long taskId, [FromBody] CreateTaskViewModel taskViewModel)
        {
            var previousState = await _tasksService.GetForEditingTaskAsync(taskId);
            var validationResult = Validator.ValidateTask(taskViewModel,
                await _homeworksService.GetForEditingHomeworkAsync(previousState.HomeworkId), previousState);

            if (validationResult.Any()) return BadRequest(validationResult);

            var updatedTask =
                await _tasksService.UpdateTaskAsync(taskId, taskViewModel.ToHomeworkTask(),
                    taskViewModel.ActionOptions ?? ActionOptions.Default);
            return Ok(updatedTask.ToHomeworkTaskViewModel());
        }

        [HttpPost("addQuestion")]
        public async Task<IActionResult> AddQuestionForTask([FromBody] AddTaskQuestionDto question)
        {
            var studentId = Request.GetUserIdFromHeader();
            var task = await _tasksService.GetTaskAsync(question.TaskId);
            if (studentId == null || task == null) return NotFound();

            if (string.IsNullOrEmpty(question.Text))
                return BadRequest("Текст вопроса пуст");

            if (!await _coursesService.HasStudent(task.Homework.CourseId, studentId))
                return Forbid();

            await _questionsRepository.AddAsync(new TaskQuestion
            {
                TaskId = task.Id,
                StudentId = studentId,
                Text = question.Text,
                IsPrivate = question.IsPrivate,
            });
            return Ok();
        }

        [HttpGet("questions/{taskId}")]
        public async Task<IActionResult> GetQuestionsForTask(long taskId)
        {
            var userId = Request.GetUserIdFromHeader();
            var task = await _tasksService.GetTaskAsync(taskId);
            if (userId == null || task == null) return NotFound();

            var courseId = task.Homework.CourseId;
            var isLecturer = (await _coursesService.GetCourseLecturers(courseId)).Contains(userId);
            var isStudent = await _coursesService.HasStudent(courseId, userId);
            if (!isLecturer && !isStudent)
                return Forbid();

            var questions = _questionsRepository.FindAll(x => x.TaskId == taskId);
            questions = isLecturer ? questions : questions.Where(x => !x.IsPrivate || x.StudentId == userId);

            var result = (await questions.ToListAsync()).Select(x => new GetTaskQuestionDto
            {
                Id = x.Id,
                StudentId = x.StudentId,
                Text = x.Text,
                Answer = x.Answer,
                IsPrivate = x.IsPrivate,
                LecturerId = x.LecturerId
            });
            return Ok(result);
        }

        [HttpPost("addAnswer")]
        public async Task<IActionResult> GetQuestionsForTask(AddAnswerForQuestionDto answer)
        {
            if (string.IsNullOrEmpty(answer.Answer))
                return BadRequest("Текст ответа пуст");

            var lecturerId = Request.GetUserIdFromHeader();
            if (lecturerId == null) return NotFound();

            var question = await _questionsRepository.FindAsync(x => x.Id == answer.QuestionId);
            if (question == null) return NotFound();

            var task = await _tasksService.GetTaskAsync(question.TaskId);
            if (task == null) return NotFound();

            var courseId = task.Homework.CourseId;
            var isLecturer = (await _coursesService.GetCourseLecturers(courseId)).Contains(lecturerId);
            if (!isLecturer) return Forbid();

            await _questionsRepository.UpdateAsync(question.Id, x => new TaskQuestion
            {
                LecturerId = lecturerId,
                Answer = answer.Answer
            });
            return Ok();
        }
    }
}
