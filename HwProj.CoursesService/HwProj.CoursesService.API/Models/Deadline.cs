using System;
using HwProj.Repositories;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace HwProj.CoursesService.API.Models
{
    public class Deadline : IEntity<long>
    {
        public long Id { get; set; }
        
        public string JobId { get; set; }
        
        [JsonConverter(typeof(StringEnumConverter))]
        public DeadlineType DeadlineType { get; set; }
        
        public int CorrectionNumber { get; set; }
        
        public bool IsExpired { get; set; }
        
        public string AffectedStudentId { get; set; }
        
        public int ToSubtract { get; set; }
        
        public DateTime DateTime { get; set; }
        
        public long TaskId { get; set; } 
        
        public HomeworkTask Task { get; set; }
    }
}
