using Newtonsoft.Json;

namespace HwProj.CoursesService.API.Models
{
    public static class CourseFilterJsonSettings
    {
        public static readonly JsonSerializerSettings Settings = new JsonSerializerSettings
        {
            NullValueHandling = NullValueHandling.Ignore,
            MissingMemberHandling = MissingMemberHandling.Ignore,
            DefaultValueHandling = DefaultValueHandling.Populate
        };
    }
}