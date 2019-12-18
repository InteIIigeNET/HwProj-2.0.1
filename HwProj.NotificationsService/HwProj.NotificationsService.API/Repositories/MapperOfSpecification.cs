using HwProj.NotificationsService.API.Models;

namespace HwProj.NotificationsService.API.Repositories
{
    public class MapperOfSpecification
    {
        public Specification GetSpecification(string userId, int timeSpan = 0, NotificationFilter filter = null)
        {
            if (filter.HasSeen != null)
            {
                return new AndSpecification(new HasSeenNotificationSpecification(), new UserNotificationSpecification(userId));
            }
            else if (filter.Important != null)
            {
                return new AndSpecification(new ImprotanceOfNotificationSpecification(), new UserNotificationSpecification(userId));
            }
            else if (filter.TimeSpan != null)
            {
                return new AndSpecification(new GetInTimeNotificationSpecification(timeSpan), new UserNotificationSpecification(userId));
            }
            else
            {
                return new UserNotificationSpecification(userId);
            }
        }
    }
}