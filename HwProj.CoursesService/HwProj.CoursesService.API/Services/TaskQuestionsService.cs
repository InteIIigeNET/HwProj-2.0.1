using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.NotificationService.Events.CoursesService;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Services
{
    public class TaskQuestionsService : ITaskQuestionsService
    {
        private readonly ITaskQuestionsRepository _taskQuestionsRepository;
        private readonly ICoursesRepository _coursesRepository;
        private readonly IEventBus _eventBus;

        public TaskQuestionsService(ITaskQuestionsRepository taskQuestionsRepository,
            ICoursesRepository coursesRepository, IEventBus eventBus)
        {
            _taskQuestionsRepository = taskQuestionsRepository;
            _coursesRepository = coursesRepository;
            _eventBus = eventBus;
        }

        /// <param name="studentCourse">Курс глазами автора вопроса: в MentorIds только преподаватели, которым он виден</param>
        public async Task<long> AddQuestionAsync(TaskQuestion taskQuestion, HomeworkTask task, CoursePreview studentCourse)
        {
            var questionId = await _taskQuestionsRepository.AddAsync(taskQuestion);

            _eventBus.Publish(new NewTaskQuestionEvent
            {
                CourseId = studentCourse.Id,
                CourseName = studentCourse.Name,
                TaskId = task.Id,
                TaskTitle = task.Title,
                StudentId = taskQuestion.StudentId,
                Text = taskQuestion.Text,
                IsPrivate = taskQuestion.IsPrivate,
                MentorIds = studentCourse.MentorIds
            });

            return questionId;
        }

        public async Task<TaskQuestion> GetQuestionAsync(long taskQuestionId)
            => await _taskQuestionsRepository.FindAsync(x => x.Id == taskQuestionId);

        public async Task<List<TaskQuestion>> GetQuestionsForLecturerAsync(long taskId)
            => await GetALlTaskQuestions(taskId).ToListAsync();

        public Task<List<TaskQuestion>> GetQuestionsForLecturerAsync(long[] taskIds) =>
            _taskQuestionsRepository.FindAll(x => taskIds.Contains(x.TaskId)).ToListAsync();

        public Task<List<TaskQuestion>> GetStudentQuestionsAsync(long taskId, string studentId)
        {
            var allQuestions = GetALlTaskQuestions(taskId);
            return allQuestions.Where(x => !x.IsPrivate || x.StudentId == studentId).ToListAsync();
        }

        public async Task AddAnswerAsync(TaskQuestion question, HomeworkTask task, string lecturerId, string answer)
        {
            await _taskQuestionsRepository.UpdateAsync(question.Id, x => new TaskQuestion
            {
                LecturerId = lecturerId,
                Answer = answer
            });

            var course = await _coursesRepository.GetAsync(task.Homework.CourseId);
            _eventBus.Publish(new TaskQuestionAnsweredEvent
            {
                CourseId = course.Id,
                CourseName = course.Name,
                TaskId = task.Id,
                TaskTitle = task.Title,
                StudentId = question.StudentId,
                LecturerId = lecturerId,
                Question = question.Text,
                Answer = answer
            });
        }

        private IQueryable<TaskQuestion> GetALlTaskQuestions(long taskId)
            => _taskQuestionsRepository.FindAll(x => x.TaskId == taskId);
    }
}
