using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.EventBus.Client.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Services
{
    public class DeadlinesService : IDeadlinesService
    {
        private readonly IDeadlinesRepository _deadlinesRepository;
        private readonly IEventBus _eventBus;

        public DeadlinesService(IEventBus eventBus, IDeadlinesRepository deadlinesRepository)
        {
            _eventBus = eventBus;
            _deadlinesRepository = deadlinesRepository;
        }

        public async Task<long> AddDeadlineAsync(long taskId, Deadline deadline)
        {
            deadline.TaskId = taskId;
            return await _deadlinesRepository.AddAsync(deadline);
        }

        public async Task DeleteDeadline(long deadlineId)
        { 
            await _deadlinesRepository.DeleteAsync(deadlineId);
        }

        public async Task<Deadline[]> GetAllDeadlinesAsync()
        {
            return await _deadlinesRepository.GetAll().ToArrayAsync();
        }
    }
}
