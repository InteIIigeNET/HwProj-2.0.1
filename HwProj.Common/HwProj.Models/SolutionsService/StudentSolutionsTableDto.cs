using System.Collections.Generic;

namespace HwProj.Models.SolutionsService
{
    public class StudentSolutionsTableDto
    {
        public string StudentId { get; set; }
        public List<Homework> Homeworks { get; set; }
        
        public class Homework
        {
            public long Id { get; set; }
            public List<Task> Tasks { get; set; } = new List<Task>();
        }
    
        public class Task
        {
            public long Id { get; set; }
            public List<SolutionDto> Solutions { get; set; } = new List<SolutionDto>();
        }
    }
}
