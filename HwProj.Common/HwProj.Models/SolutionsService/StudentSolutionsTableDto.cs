using System.Collections.Generic;

namespace HwProj.Models.SolutionsService
{
    public class StudentSolutionsTableDto
    {
        public string StudentId { get; set; }
        public List<StudentSolutionsTableHomeworkDto> Homeworks { get; set; }
    }
    
    public class StudentSolutionsTableHomeworkDto
    {
        public long Id { get; set; }
        public List<StudentSolutionsTableTaskDto> Tasks { get; set; } = new List<StudentSolutionsTableTaskDto>();
    }
    
    public class StudentSolutionsTableTaskDto
    {
        public long Id { get; set; }
        public List<SolutionDto> Solutions { get; set; } = new List<SolutionDto>();
    }
}
