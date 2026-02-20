using System.Collections.Generic;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;

namespace HwProj.CoursesService.API.Services
{
    public interface ITaskQuestionsService
    {
        Task<long> AddQuestionAsync(TaskQuestion taskQuestion);
        Task<TaskQuestion> GetQuestionAsync(long taskQuestionId);
        Task<List<TaskQuestion>> GetQuestionsForLecturerAsync(long taskId);
        Task<List<TaskQuestion>> GetQuestionsForLecturerAsync(long[] taskIds);
        Task<List<TaskQuestion>> GetStudentQuestionsAsync(long taskId, string studentId);
        Task AddAnswerAsync(long questionId, string lecturerId, string answer);
    }
}