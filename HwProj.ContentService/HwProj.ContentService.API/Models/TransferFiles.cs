namespace HwProj.ContentService.API.Models;

public record TransferFiles
{
    public List<ScopeMappingPair> ScopeMapping { get; set; } = new List<ScopeMappingPair>();
}
