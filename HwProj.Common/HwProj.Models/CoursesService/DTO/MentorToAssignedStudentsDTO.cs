using System.Collections.Generic;

namespace HwProj.Models.CoursesService.DTO
{
    public class MentorToAssignedStudentsDTO
    {
        public string MentorId { get; set; }
        
        public List<string> SelectedStudentsIds { get; set; } = new List<string>();
    }
}