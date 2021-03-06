﻿using System.Threading.Tasks;
using HwProj.SolutionsService.API.Models;

namespace HwProj.SolutionsService.API.Services
{
    public interface ISolutionsService
    {
        Task<Solution[]> GetAllSolutionsAsync();

        Task<Solution> GetSolutionAsync(long solutionId);

        Task<Solution[]> GetTaskSolutionsFromStudentAsync(long taskId, string studentId);

        Task<Solution[]> GetTaskSolutionsFromGroupAsync(long taskId, long groupId);

        Task<long> AddSolutionAsync(long taskId, Solution solution);

        Task RateSolutionAsync(long solutionId, int newRating);

        Task DeleteSolutionAsync(long solutionId);
        
        Task MarkSolutionFinal(long solutionId);
    }
}
