using System.Collections.Generic;

namespace HwProj.Models.ContentService.DTO
{
    public class TransferFilesDTO
    {
        public List<ScopeMappingPairDTO> ScopeMapping { get; set; } = new List<ScopeMappingPairDTO>();
    }
}
