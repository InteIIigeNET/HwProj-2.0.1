using System.Collections.Generic;
using Newtonsoft.Json;

namespace HwProj.CoursesService.API.Models
{
    public class Filter
    {
        [JsonProperty(PropertyName = "STUD")] 
        public List<string> StudentIds { get; set; } = new List<string>();
        
        [JsonProperty(PropertyName = "HMW")] 
        public List<long> HomeworkIds { get; set; } = new List<long>();
        
        [JsonProperty(PropertyName = "MENT")]
        public List<string> MentorIds { get; set; } = new List<string>();
    }
}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 