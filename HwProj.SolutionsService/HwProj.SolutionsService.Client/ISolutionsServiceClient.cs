﻿using System.Threading.Tasks;
using HwProj.Models.SolutionsService;
using HwProj.Models.StatisticsService;

namespace HwProj.SolutionsService.Client
{
    public interface ISolutionsServiceClient
    { 
        Task<Solution[]> GetAllSolutions();
        Task<Solution> GetSolutionById(long solutionId);
        Task<Solution[]> GetUserSolution(long taskId, string studentId);
        Task<long> PostSolution(SolutionViewModel model, long taskId);
        Task RateSolution(long solutionId, int newRating, string lecturerComment, string lecturerId);
        Task MarkSolution(long solutionId);
        Task DeleteSolution(long solutionId);
        Task<long> PostGroupSolution(SolutionViewModel model, long taskId, long groupId);
        Task<Solution[]> GetTaskSolutions(long groupId, long taskId);
        Task<StatisticsCourseMatesModel[]> GetCourseStatistics(long courseId, string userId);
    }
}
