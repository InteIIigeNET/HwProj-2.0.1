using System.ComponentModel.DataAnnotations;

namespace HwProj.Models.CoursesService.ViewModels
{
    public class ReviewRegistrationRequestViewModel
    {
        [Required]
        public long RequestId { get; set; }
        
        // Approve or Reject
        [Required]
        public string Decision { get; set; }
        
        public string? RejectReason { get; set; }
    }
}