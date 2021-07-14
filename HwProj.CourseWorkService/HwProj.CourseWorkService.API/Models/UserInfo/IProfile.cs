using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Models.UserInfo
{
    public interface IProfile : IEntity<string>
    {
        string UserId { get; set; }
    }
}
