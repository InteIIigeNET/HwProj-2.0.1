namespace HwProj.ContentService.API.Models;

public record ScopeMappingPair
{
    public Scope SourceScope { get; set; }
    public Scope TargetScope { get; set; }
}
