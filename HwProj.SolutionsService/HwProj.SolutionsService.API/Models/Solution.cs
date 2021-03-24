using HwProj.Repositories;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace HwProj.SolutionsService.API.Models
{
    public class Solution : IEntity<long>
    {
        public long Id { get; set; }

        public string GithubUrl { get; set; }
        
        public string Comment { get; set; }

        [JsonConverter(typeof(StringEnumConverter))]
        public SolutionState State { get; set; }
        
        public int Rating { get; set; }
        
        public int MaxRating { get; set; }
        
        public string StudentId { get; set; }

        public long? GroupId { get; set; }
        
        public long TaskId { get; set; }
    }
}
