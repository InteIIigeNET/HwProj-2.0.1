using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using HwProj.NotificationsService.API.Models;

namespace HwProj.NotificationsService.Tests
{
    public class FakeData
    {
        public static Task<Notification[]> GetGenericNotifications(int count)
        {
            var notifications = new Notification[100];
            for(var i = 0; i < count; ++i)
            {
                var notification = new Notification();
                if (i % 2 == 0)
                {
                    notification.HasSeen = true;
                    notification.Body = "Task was accepted";
                    notification.Date = DateTime.Now.AddDays(i);
                    notification.Sender = "HomeworkService";
                    notification.Important = false;
                    notification.Id = i;
                    notification.Category = "Homework";
                    notification.Owner = "user";
                }
                else
                {
                    notification.HasSeen = false;
                    notification.Body = "Task was rejected";
                    notification.Date = DateTime.Now.AddDays(++i);
                    notification.Sender = "HomeworkService";
                    notification.Important = true;
                    notification.Id = ++i;
                    notification.Category = "Homework";
                    notification.Owner = "user";
                }
            }
            return GetGenericNotifications(count);
        }
    }
}
