namespace HwProj.Models.CoursesService
{
    public static class HomeworkTags
    {
        public const string Test = "Контрольная работа";
        public const string BonusTask = "Доп. баллы";
        public const string GroupWork = "Командная работа";
        public static readonly string[] DefaultTags = { Test, BonusTask, GroupWork };
    }
}
