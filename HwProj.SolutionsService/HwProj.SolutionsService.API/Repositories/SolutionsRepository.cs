using System;
using System.Linq;
using System.Threading.Tasks;
using HwProj.Models.SolutionsService;
using HwProj.Repositories;
using HwProj.SolutionsService.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HwProj.SolutionsService.API.Repositories
{
    public class SolutionsRepository : CrudRepository<Solution, long>, ISolutionsRepository
    {

        public SolutionsRepository(SolutionContext context)
            : base(context)
        {
        }

        public async Task RateSolutionAsync(long solutionId, SolutionState newState, int newRating, string lecturerComment)
        {
            await UpdateAsync(solutionId, solution => new Solution
            {
                State = newState, 
                Rating = newRating, 
                LecturerComment = lecturerComment 
            });
        }
        
        public async Task ChangeTaskSolutionsMaxRatingAsync(long taskId, int newMaxRating)
        {
            var solutions = await Context.Set<Solution>().Where(solution => solution.TaskId == taskId)
                .ToArrayAsync()
                .ConfigureAwait(false);

            foreach (var solution in solutions)
            {                
                if (solution.Rating == newMaxRating)
                    solution.State = SolutionState.Final;
                else if (solution.State != SolutionState.Posted && solution.Rating < newMaxRating) 
                    solution.State = SolutionState.Rated;
            }

            await Context.SaveChangesAsync().ConfigureAwait(false);
        }

        public async Task ChangeSolutionMaxRatingAsync(long solutionId, int newMaxRating)
        {
            var solution = await GetAsync(solutionId);
            //solution.MaxRating = newMaxRating;
            
            if (solution.Rating == newMaxRating)
                solution.State = SolutionState.Final;
            else if (solution.State == SolutionState.Posted && solution.Rating < newMaxRating) 
                solution.State = SolutionState.Rated;
            
            await Context.SaveChangesAsync().ConfigureAwait(false);
        }
        
        public async Task UpdateSolutionState(long solutionId, SolutionState newState)
        {
            await UpdateAsync(solutionId, solution => new Solution {State = newState}).ConfigureAwait(false);
        }
    }
}
