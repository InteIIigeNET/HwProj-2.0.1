using AutoMapper;
using HwProj.Models.NotificationsService;

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