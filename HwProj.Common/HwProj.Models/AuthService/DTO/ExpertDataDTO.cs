using System.Collections.Generic;

namespace HwProj.Models.AuthService.DTO
{
    public class ExpertDataDTO
    {
        public string Id { get; set; }
        
        public string Name { get; set; }
        
        public string Surname { get; set; }

        public string MiddleName { get; set; }
        
        public string Email { get; set; }
        
        public string Bio { get; set; }
        
        public string CompanyName { get; set; }

        public List<string> Tags { get; set; } = new List<string>();

        public string LecturerId { get; set; }
    }
}