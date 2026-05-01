using System.ComponentModel.DataAnnotations;

namespace HwProj.Models.CoursesService.ViewModels
{
    public class CancelRegistrationRequestViewModel
    {
        [Required]
        public long RequestId { get; set; }
    }
}