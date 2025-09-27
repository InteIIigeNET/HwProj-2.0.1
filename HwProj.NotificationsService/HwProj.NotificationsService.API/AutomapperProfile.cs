using AutoMapper;
using HwProj.Models.NotificationsService;
using Notification = HwProj.NotificationsService.API.Models.Notification;

namespace HwProj.NotificationsService.API
{
    public class AutomapperProfile : Profile
    {
        public AutomapperProfile()
        {
            CreateMap<Notification, NotificationViewModel>().ReverseMap();
        }
    }
}