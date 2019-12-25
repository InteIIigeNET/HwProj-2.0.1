using System;
using System.Linq.Expressions;
using HwProj.NotificationsService.API.Models;

namespace HwProj.NotificationsService.API.Repositories
{
    public class HasSeenNotificationSpecification : Specification<Notification>
    {
        public override Expression<Func<Notification, bool>> ToExpression()
        {
            return notification => notification.HasSeen == true;
        }
    }

    public class ImprotanceOfNotificationSpecification : Specification<Notification>
    {
        public override Expression<Func<Notification, bool>> ToExpression()
        {
            return notification => notification.Important == true;
        }
    }

    public class GetInTimeNotificationSpecification : Specification<Notification>
    {
        private readonly (DateTime, DateTime) _timeSpan;

        public GetInTimeNotificationSpecification((string, string) timeSpan)
        {
            _timeSpan = ConverterToDateFormat(timeSpan);
        }

        public override Expression<Func<Notification, bool>> ToExpression()
        {
            return notification => DateTime.Compare(notification.Date, _timeSpan.Item1) <= 0 && DateTime.Compare(notification.Date, _timeSpan.Item2) >= 0;
        }

        private (DateTime, DateTime) ConverterToDateFormat((string, string) timeSpan)
        {
            try
            {
                var _timeSpan = (Convert.ToDateTime(timeSpan.Item1), Convert.ToDateTime(timeSpan.Item2));
                return _timeSpan;
            }
            catch (FormatException)
            {
                return default;
            }
        }
    }

    public class UserNotificationSpecification : Specification<Notification>
    {
        private readonly string _userId;

        public UserNotificationSpecification(string userId)
        {
            _userId = userId;
        }

        public override Expression<Func<Notification, bool>> ToExpression()
        {
            return notification => notification.Owner == _userId;
        }
    }
}
