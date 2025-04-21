using HwProj.Models.CoursesService.DTO;

namespace HwProj.Models.CoursesService.ViewModels
{
    public class CourseMateViewModel
    {
        public string StudentId { get; set; }
        public bool IsAccepted { get; set; }
        public StudentCharacteristicsDto? Characteristics { get; set; }
    }
}
