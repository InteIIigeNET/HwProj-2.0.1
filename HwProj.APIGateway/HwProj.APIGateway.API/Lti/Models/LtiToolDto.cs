namespace HwProj.APIGateway.API.Lti.Models
{
    public class LtiToolDto(long id, string name)
    {
        public long Id  { get; init; } = id;
        public string Name { get; init; } = name;
    }
}