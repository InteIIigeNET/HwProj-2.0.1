using System.Linq;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.Models.Roles;
using HwProj.NotificationsService.API.Models;
using Z.EntityFramework.Plus;

namespace HwProj.NotificationsService.API.Repositories
{
    public interface INotificationSettingsRepository
    {
        Task<NotificationsSetting?> GetAsync(string userId, string category);
        Task ChangeAsync(string userId, string category, bool enabled);
    }

    public class NotificationSettingsRepository : INotificationSettingsRepository
    {
        private readonly NotificationsContext _context;
        private readonly IAuthServiceClient _authServiceClient;

        public NotificationSettingsRepository(
            IAuthServiceClient authServiceClient,
            NotificationsContext context)
        {
            _context = context;
            _authServiceClient = authServiceClient;
        }

        public async Task<NotificationsSetting?> GetAsync(string userId, string category)
        {
            var setting = await _context.Settings.FindAsync(userId, category);
            if (setting != null) return setting;

            if (category != NotificationsSettingCategory.NewSolutionsCategory
                && category != NotificationsSettingCategory.OtherEventsCategory)
                return setting;

            var user = await _authServiceClient.GetAccountData(userId);
            var defaultSetting = new NotificationsSetting()
            {
                UserId = userId,
                Category = category,
                IsEnabled = user.Role != Roles.ExpertRole
            };
            await _context.Settings.AddAsync(defaultSetting);
            await _context.SaveChangesAsync();
            return defaultSetting;
        }

        public async Task ChangeAsync(string userId, string category, bool enabled)
        {
            await _context.Settings
                .Where(x => x.UserId == userId && x.Category == category)
                .UpdateAsync(x => new NotificationsSetting
                {
                    UserId = userId,
                    Category = category,
                    IsEnabled = enabled
                });
        }
    }
}
