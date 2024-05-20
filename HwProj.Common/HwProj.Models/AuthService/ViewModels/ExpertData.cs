using System.ComponentModel.DataAnnotations;
using HwProj.Repositories;

namespace HwProj.Models.AuthService.ViewModels
{
    public class ExpertData : IEntity<string>
    {
        [Key]
        [MaxLength(450)]
        public string Id { get; set; }

        public bool IsProfileEdited { get; set; }

        [MaxLength(450)]
        public string LecturerId { get; set; }
    }
}