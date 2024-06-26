﻿using System;
using System.Threading.Tasks;
using HwProj.Models.SolutionsService;
using HwProj.Repositories;

namespace HwProj.SolutionsService.API.Repositories
{
    public interface ISolutionsRepository : ICrudRepository<Solution, long>
    {
        Task RateSolutionAsync(long solutionId, SolutionState newState, string lecturerId, int newRating, 
            DateTime ratingDate, string lecturerComment);

        Task ChangeTaskSolutionsMaxRatingAsync(long solutionId, int newMaxRating);

        Task UpdateSolutionState(long solutionId, SolutionState newState);
    }
}
