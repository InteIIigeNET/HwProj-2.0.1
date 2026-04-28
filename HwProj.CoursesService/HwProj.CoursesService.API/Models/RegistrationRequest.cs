using System;
using System.ComponentModel.DataAnnotations;
using HwProj.Repositories.Net8;

namespace HwProj.CoursesService.API.Models
{
    public class RegistrationRequest : IEntity<long>
    {
        [Key] 
        public long Id { get; set; }
        
        // Type of request to join to the service: by course or by separated page
        public RegistrationRequestScopeType ScopeType { get; set; }
        
        public long? CourseId  { get; set; }
        
        public string Name { get; set; }

        public string Surname { get; set; }

        public string MiddleName { get; set; }
        
        public string Email { get; set; }
        
        // Status of the request to registration
        public RegistrationRequestStatus Status { get; set; }
        
        public DateTime CreatedAtUtc { get; set; }
        
        public DateTime UpdatedAtUtc { get; set; }
        
        public DateTime? ReviewedAtUtc { get; set; }
        
        public string? ReviewedByUserId { get; set; }
        
        public string? RejectReason { get; set; }
        
        public string? ResolvedUserId { get; set; }

    }
}

public enum RegistrationRequestScopeType
{
    Global = 0,
    Course = 1
}

public enum RegistrationRequestStatus
{
    Pending = 0,
    Approved = 1,
    Rejected = 2
}

public enum RegistrationRequestSourceType
{
    Website = 0,
    CourseLink = 1
}