using System;
using System.Collections.Generic;
using System.Linq;
using HwProj.NotificationsService.API.Models;

namespace HwProj.NotificationsService.API.Repositories
{
    public class MapperOfSpecification 
    {
        public Specification GetSpecification(NotificationFilter filter)
        {
            var specsList = new List<(Predicate<NotificationFilter>, Func<NotificationFilter, Specification>)>
            {
                (idFilter => true, idFilter => new UserNotificationSpecification(idFilter.Owner)),
                (hasSeenFilter => hasSeenFilter.HasSeen != null, hasSeenFilter => new HasSeenNotificationSpecification()),
                (importanceFilter => importanceFilter.Important != null, importanceFilter => new ImprotanceOfNotificationSpecification()),
                (getInTimeFilter => getInTimeFilter.TimeSpan != (null, null), getInTimeFilter => new GetInTimeNotificationSpecification(getInTimeFilter.TimeSpan))
            };

            return specsList.Aggregate(new UserNotificationSpecification(filter.Owner) as Specification, (specification, next) => next.Item1.Invoke(filter)
                ? specification.And(next.Item2.Invoke(filter))
                : new UserNotificationSpecification(filter.Owner));
        }
    }
}

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      