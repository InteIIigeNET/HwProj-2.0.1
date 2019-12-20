using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;

public class MapperOfSpecification 
{
    public Specification GetSpecification(NotificationFilter filter)
    {
        var specsList = new List<(Predicate<NotificationFilter>, Func<NotificationFilter, Specification>)>
        {
            ((NotificationFilter idFilter) => true, (NotificationFilter idFilter) => new UserNotificationSpecification(idFilter.Owner)),
            ((NotificationFilter hasSeenFilter) => hasSeenFilter.HasSeen != null, (NotificationFilter hasSeenFilter) => new HasSeenNotificationSpecification()),
            ((NotificationFilter importanceFilter) => importanceFilter.Important != null, (NotificationFilter importanceFilter) => new ImprotanceOfNotificationSpecification()),
            ((NotificationFilter getInTimeFilter) => getInTimeFilter.HasSeen != null, (NotificationFilter getInTimeFilter) => new GetInTimeNotificationSpecification(getInTimeFilter.TimeSpan))
        };

        return specsList.Aggregate(new UserNotificationSpecification(filter.Owner) as Specification, (specification, next) => next.Item1.Invoke(filter)
                                                                                                                    ? specification.And(next.Item2.Invoke(filter))
                                                                                                                    : new UserNotificationSpecification(filter.Owner));
    }
}

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      