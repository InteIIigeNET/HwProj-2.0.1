namespace HwProj.APIGateway.API.Lti.Models;

public class LtiDeepLinkingContentItem
{
    public string Type { get; set; } // "ltiResourceLink"
    public string Url { get; set; }  // Ссылка на запуск (Launch URL)
    public string Title { get; set; } // Название задачи
    public string Text { get; set; }  // Описание
}