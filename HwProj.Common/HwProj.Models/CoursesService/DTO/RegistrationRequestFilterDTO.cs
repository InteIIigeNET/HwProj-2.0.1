namespace HwProj.Models.CoursesService.DTO
{
    public class RegistrationRequestFilterDTO
    {
        public long? CourseId { get; set; }
        
        public string? ScopeType { get; set; }
        
        public string? Status { get; set; }
        
        public string? Email { get; set; }
        
        public int Offset { get; set; } = 0;
        
        public int Limit { get; set; } = 50;

    }
}