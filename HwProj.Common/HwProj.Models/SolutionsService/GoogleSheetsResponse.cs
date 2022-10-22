namespace HwProj.Models.SolutionsService;

public class GoogleSheetsResponse
{
    public GoogleSheetsResponse(string response, string status)
    {
        Response = response;
        Status = status;
    }

    [Newtonsoft.Json.JsonPropertyAttribute("response")]
    private string Response { get; set; }

    [Newtonsoft.Json.JsonPropertyAttribute("status")]
    public string Status { get; set; }
}