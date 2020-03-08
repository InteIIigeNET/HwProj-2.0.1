using System;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CourseWorkService.API.Services
{
    public class DeadlineService : IDeadlineService
    {
        private readonly IDeadlinesRepository _deadlinesRepository;
        
        public DeadlineService(IDeadlinesRepository deadlinesRepository)
        {
            _deadlinesRepository = deadlinesRepository;
        }

        public async Task<Deadline> GetDeadlineAsync(long deadlineId)
        {
            return await _deadlinesRepository.GetAsync(deadlineId);
        }

        public async Task<Deadline[]> GetAllDeadlinesAsync()
        {
            return await _deadlinesRepository.GetAll().ToArrayAsync();
        }

        public async Task<Deadline[]> GetFilteredDeadlinesAsync(Expression<Func<Deadline, bool>> predicate)
        {
            return await _deadlinesRepository.FindAll(predicate).ToArrayAsync();
        }

        public async Task<long> AddDeadlineAsync(Deadline deadline)
        {
            return await _deadlinesRepository.AddAsync(deadline);
        }

        public async Task DeleteDeadlineAsync(long deadlineId)
        {
            await _deadlinesRepository.DeleteAsync(deadlineId);
        }

        public async Task UpdateDeadlineAsync(long deadlineId, Deadline update)
        {
            var newDeadline = await _deadlinesRepository.GetAsync(deadlineId).ConfigureAwait(false);
            newDeadline.DeadlineDate = update.DeadlineDate;
            await _deadlinesRepository.UpdateAsync(deadlineId, d => newDeadline);
        }
    }
}
