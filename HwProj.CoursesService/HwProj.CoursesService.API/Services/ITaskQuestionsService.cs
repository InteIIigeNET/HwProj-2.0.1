using System.Collections.Generic;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Services
{
    public interface ITaskQuestionsService
    {
        Task<long> AddQuestionAsync(TaskQuestion taskQuestion, HomeworkTask task, CoursePreview studentCourse);
        Task<TaskQuestion> GetQuestionAsync(long taskQuestionId);
        Task<List<TaskQuestion>> GetQuestionsForLecturerAsync(long taskId);
        Task<List<TaskQuestion>> GetQuestionsForLecturerAsync(long[] taskIds);
        Task<List<TaskQuestion>> GetStudentQuestionsAsync(long taskId, string studentId);
        Task AddAnswerAsync(TaskQuestion question, HomeworkTask task, string lecturerId, string answer);
    }
}