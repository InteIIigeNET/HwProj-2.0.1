using System.Text.Json.Serialization;

namespace HwProj.APIGateway.API.Models.Solutions;

public class PostSolutionModel
{
    public string? GithubUrl { get; set; }
    public string? Comment { get; set; }
    public string[]? GroupMateIds { get; set; }
}

public class PostAutomatedSolutionModel
{
    /// Идентификатор задачи: название или id на HwProj, в зависимости от параметра TaskIdType
    public required string TaskId { get; init; }

    /// Тип идентификатора задачи (TaskId): Title или Id на HwProj
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public TaskIdType TaskIdType { get; init; } = TaskIdType.Id;

    /// Идентификатор студента: ФИО (в любом порядке), id на HwProj или привязанный GitHub-логин;
    /// в зависимости от параметра StudentIdType
    public required string StudentId { get; init; }

    /// Тип идентификатора студента (StudentId): ФИО (в любом порядке), id на HwProj или привязанный GitHub-логин
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public StudentIdType StudentIdType { get; init; } = StudentIdType.Id;

    /// Ссылка на решение, будь то PR, репозиторий или другой источник
    public string? GithubUrl { get; init; }

    /// Комментарий к решению, здесь можно оставить полезную информацию, которая будет отображаться при проверке решения в сервисе
    public string? Comment { get; init; }
}

public enum TaskIdType
{
    /// Внутренний идентификатор задачи на HwProj 
    Id,

    /// Полное название назади
    Title
}

public enum StudentIdType
{
    /// Внутренний идентификатор студента на HwProj
    Id,

    /// Полное имя студента
    FullName,

    /// Привязанный к HwProj логин студента на GitHub
    GitHub
}
