using System.Collections.Generic;

namespace HwProj.Models.AuthService.DTO
{
    public class UpdateExpertTagsDTO
    {
        public string ExpertId { get; set; }
        
        public List<string> Tags { get; set; } = new List<string>();
    }
}