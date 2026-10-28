namespace HwProj.NotificationsService.API.Models
{
    /// <summary> Тип события в письме-дайжесте </summary>
    public enum DigestItemKind
    {
        NewSolution,
        NewCourseMate,
        SolutionRated,
        NewHomework,
        NewTask,
        HomeworkUpdated,
        TaskUpdated,
        AcceptedToCourse,
        RejectedFromCourse,
        InvitedToCourse,
        BecameLecturer
    }
}
