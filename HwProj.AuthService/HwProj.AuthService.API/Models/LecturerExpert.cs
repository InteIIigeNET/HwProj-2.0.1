using HwProj.Repositories;
using System.ComponentModel.DataAnnotations;

namespace HwProj.AuthService.API.Models
{
    public class LecturerExpert : IEntity<long>
    {
        [Key]
        public long Id { get; set; }
        
        [MaxLength(450)]
        public string LecturerId { get; set; }
        
        [MaxLength(450)]
        public string ExpertId { get; set; }
    }
}