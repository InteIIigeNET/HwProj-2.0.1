using System.Collections.Generic;

namespace HwProj.Models.ContentService.DTO
{
    
    public class FileLinkDTO
    {
        public string DownloadUrl { get; set; }
        public List<ScopeDTO> fileScopes { get; set; }
    }
}
