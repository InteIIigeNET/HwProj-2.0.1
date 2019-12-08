using System;
using System.Linq.Expressions;
using HwProj.NotificationsService.API.Models;

namespace HwProj.NotificationsService.API.Repositories
{
    public class HasSeenNotificationSpecification : Specification
    {
        public override Expression<Func<Notification, bool>> ToExpression()
        {
            return notification => notification.HasSeen;
        }
    }

    public class ImprotanceOfNotificationSpecification : Specification
    {
        public override Expression<Func<Notification, bool>> ToExpression()
        {
            return notification => notification.Important;
        }
    }

    public class UserNotificationSpecification : Specification
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
