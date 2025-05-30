﻿using System.Threading.Tasks;
using HwProj.Models.SolutionsService;
using HwProj.Models.StatisticsService;

namespace HwProj.SolutionsService.Client
{
    public interface ISolutionsServiceClient
    {
        Task<Solution[]> GetAllSolutions();
        Task<Solution> GetSolutionById(long solutionId);
        Task<Solution[]> GetUserSolutions(long taskId, string studentId);
        Task<long> PostSolution(long taskId, PostSolutionModel model);
        Task PostEmptySolutionWithRate(long taskId, SolutionViewModel solution);
        Task RateSolution(long solutionId, RateSolutionModel rateSolutionModel);
        Task MarkSolution(long solutionId);
        Task DeleteSolution(long solutionId);
        Task<long> PostGroupSolution(SolutionViewModel model, long taskId, long groupId);
        Task<Solution[]> GetTaskSolutions(long groupId, long taskId);
        Task<StatisticsCourseMatesDto[]> GetCourseStatistics(long courseId, string userId);
        Task<StatisticsLecturerDTO[]> GetLecturersStatistics(long courseId);
        Task<StatisticsCourseStudentsBenchmarkDTO> GetBenchmarkStatistics(long courseId);
        Task<StudentSolutions[]> GetTaskSolutionStatistics(long courseId, long taskId);
        Task<Solution?[]> GetLastTaskSolutions(long[] taskIds, string userId);
        Task<SolutionPreviewDto[]> GetAllUnratedSolutionsForTasks(GetTasksSolutionsModel model);
        Task<TaskSolutionsStats[]> GetTaskSolutionsStats(GetTasksSolutionsModel tasksSolutionsDTO);
        Task<SolutionActualityDto> GetSolutionActuality(long solutionId);
        Task<bool> Ping();
    }
}
