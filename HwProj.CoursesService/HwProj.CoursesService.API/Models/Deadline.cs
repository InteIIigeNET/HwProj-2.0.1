using System;
using System.Collections.Generic;
using HwProj.Repositories;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace HwProj.CoursesService.API.Models
{
    public class Deadline : IEntity<long>
    {
        public long Id { get; set; }
        
        public List<string> JobId { get; set; } // List<string> is converted to a JSON object in the CourseContext
        
        [JsonConverter(typeof(StringEnumConverter))]
        public DeadlineType DeadlineType { get; set; }
        
        public int CorrectionNumber { get; set; }
        
        public bool IsStrict { get; set; }

        public List<string> AffectedStudentsId { get; set; } = new(); // Same as JobId
        
        public int ToSubtract { get; set; }
        
        public DateTime DateTime { get; set; }
        
        public long TaskId { get; set; } 
        
        public HomeworkTask Task { get; set; }
    }
}