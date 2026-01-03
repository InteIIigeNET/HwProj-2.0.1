using System.Collections.Generic;

namespace HwProj.APIGateway.API.Lti.Models;

public class AuthorizePostFormDto
{
    public string ActionUrl { get; set; }
    public string Method { get; set; } = "POST";
    public Dictionary<string,string> Fields { get; set; } = new();
}