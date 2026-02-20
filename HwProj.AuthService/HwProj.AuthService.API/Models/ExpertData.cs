using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HwProj.Repositories.Net8;

namespace HwProj.AuthService.API.Models
{
    public class ExpertData : IEntity<string>
    {
        [ForeignKey("User")]
        [MaxLength(450)]
        public string Id { get; set; }

        public User User { get; set; }

        public bool IsProfileEdited { get; set; }

        [MaxLength(450)]
        public string LecturerId { get; set; }

        public string? Tags { get; set; }
    }
}