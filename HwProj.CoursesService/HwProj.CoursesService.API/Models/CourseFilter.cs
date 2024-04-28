using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HwProj.Repositories;
using Newtonsoft.Json;

namespace HwProj.CoursesService.API.Models
{
    public class CourseFilter : IEntity<long>
    {
        [Key]
        public long Id { get; set; }
        public string FilterJson
        {
            get => JsonConvert.SerializeObject(Filter, CourseFilterJsonSettings.Settings);
            set => Filter = JsonConvert.DeserializeObject<Filter>(value, CourseFilterJsonSettings.Settings) 
                            ?? throw new InvalidOperationException("The course filter cannot be deserialized.");
        }
        [NotMapped]
        public Filter Filter { get; set; }
    }
}