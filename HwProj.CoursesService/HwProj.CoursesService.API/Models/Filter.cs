using System.Collections.Generic;
using Newtonsoft.Json;

namespace HwProj.CoursesService.API.Models
{
    public class Filter
    {
        [JsonProperty(PropertyName = "CM")]
        public List<string> CourseMateIds { get; set; }
        [JsonProperty(PropertyName = "HW")]
        public List<long> HomeworkIds { get; set; }
        [JsonProperty(PropertyName = "AS")]
        public List<long> AssignmenIds { get; set; }
    }
}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 