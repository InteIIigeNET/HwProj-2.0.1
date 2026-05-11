using System;

namespace HwProj.Models.CoursesService.DTO
{
    public class RegistrationRequestDto
    {
        public long Id { get; set; }
        
        public string? Description { get; set; }
        
        public string? PreferredLecturerEmail { get; set; }
        
        public long? CourseId { get; set; }
        
        public string RequestedRole { get; set; }
        
        public string Email { get; set; }
        
        public string Name { get; set; }
        
        public string Surname { get; set; }
        
        public string MiddleName { get; set; }
        
        public string Status { get; set; }
        
        public DateTime CreatedAtUtc { get; set; }
        
        public DateTime UpdatedAtUtc { get; set; }
        
        public DateTime? ReviewedAtUtc { get; set; }
        
        public string? ReviewedByUserId { get; set; }
        
        public string? RejectReason { get; set; }
        
        public string? ResolvedUserId { get; set; }
    }
}