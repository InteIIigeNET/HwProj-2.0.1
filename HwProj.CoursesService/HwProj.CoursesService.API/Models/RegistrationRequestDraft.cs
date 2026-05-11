using System;
using System.ComponentModel.DataAnnotations;
using HwProj.Models.CoursesService;
using HwProj.Repositories.Net8;

namespace HwProj.CoursesService.API.Models
{
    public class RegistrationRequestDraft : IEntity<long>
    {
        [Key]
        public long Id { get; set; }
        
        public string? Description { get; set; }
        
        public string? PreferredLecturerEmail { get; set; }

        public long? CourseId { get; set; }
        
        public RequestedRole RequestedRole { get; set; }

        public string Name { get; set; }

        public string Surname { get; set; }

        public string MiddleName { get; set; } = string.Empty;

        public string Email { get; set; }

        public string ConfirmationToken { get; set; }

        public DateTime CreatedAtUtc { get; set; }

        public DateTime ExpiresAtUtc { get; set; }

        public bool IsConfirmed { get; set; }
    }
}
