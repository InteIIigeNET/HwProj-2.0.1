using System.Collections.Generic;

namespace HwProj.APIGateway.API.Lti.DTOs;

public record AuthorizePostFormDto(
    string ActionUrl,
    string Method,
    Dictionary<string,string> Fields);