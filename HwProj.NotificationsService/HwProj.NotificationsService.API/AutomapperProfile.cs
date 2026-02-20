using AutoMapper;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Models;

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