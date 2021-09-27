using System.Threading.Tasks;
using AutoMapper;
using HwProj.AchievementService.API.Repositories;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.AchievementService;

namespace HwProj.AchievementService.API.Services
{
    public class AchievementService : IAchievementService
    {
        private readonly IAchievementsRepository _achievementsRepository;
        private readonly IEventBus _eventBus;
        private readonly IMapper _mapper;
        public AchievementService(IAchievementsRepository achievementsRepository, IEventBus eventBus, IMapper mapper)
        {
            _achievementsRepository = achievementsRepository;
            _eventBus = eventBus;
            _mapper = mapper;
        }

        public async Task<Achievement> GetAchievementAsync(long achievementId)
        {
            return await _achievementsRepository.GetAsync(achievementId);
        }

        public async Task<long> AddAchievementAsync(long taskId, Achievement achievement)
        {
            achievement.TaskId = taskId;
            return await _achievementsRepository.AddAsync(achievement);
        }

        public async Task DeleteAchievementAsync(long achievementId)
        {
            await _achievementsRepository.DeleteAsync(achievementId);
        }
    }
}