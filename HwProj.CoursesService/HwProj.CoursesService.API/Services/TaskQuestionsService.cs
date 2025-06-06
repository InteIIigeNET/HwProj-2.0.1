using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Services
{
    public class TaskQuestionsService : ITaskQuestionsService
    {
        private readonly ITaskQuestionsRepository _taskQuestionsRepository;

        public TaskQuestionsService(ITaskQuestionsRepository taskQuestionsRepository)
        {
            _taskQuestionsRepository = taskQuestionsRepository;
        }

        public async Task<long> AddQuestionAsync(TaskQuestion taskQuestion)
            => await _taskQuestionsRepository.AddAsync(taskQuestion);

        public async Task<TaskQuestion> GetQuestionAsync(long taskQuestionId)
            => await _taskQuestionsRepository.FindAsync(x => x.Id == taskQuestionId);

        public async Task<List<TaskQuestion>> GetQuestionsForLecturerAsync(long taskId)
            => await GetALlTaskQuestions(taskId).ToListAsync();

        public Task<List<TaskQuestion>> GetStudentQuestionsAsync(long taskId, string studentId)
        {
            var allQuestions = GetALlTaskQuestions(taskId);
            return allQuestions.Where(x => !x.IsPrivate || x.StudentId == studentId).ToListAsync();
        }

        public async Task AddAnswerAsync(long questionId, string lecturerId, string answer) 
            => await _taskQuestionsRepository.UpdateAsync(questionId, x => new TaskQuestion
            {
                LecturerId = lecturerId,
                Answer = answer
            });

        private IQueryable<TaskQuestion> GetALlTaskQuestions(long taskId)
            => _taskQuestionsRepository.FindAll(x => x.TaskId == taskId);
    }
}