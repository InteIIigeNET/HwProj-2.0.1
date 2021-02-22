using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace HwProj.CourseWorkService.API.Models
{
    public class Student : User
    {
        public int Group { get; set; }
        public string Direction { get; set; }
        public ICollection<Application> Applications { get; set; }

        public Student()
        {
            Applications = new List<Application>();
        }
    }
}
