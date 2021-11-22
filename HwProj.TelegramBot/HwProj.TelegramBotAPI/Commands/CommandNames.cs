namespace HwProj.TelegramBotAPI.Commands
{
    public static class CommandNames
    {
        public const string StartCommand = "/start";
        public const string GetCourses = "/courses";     //  /courses {courseId}
        public const string GetHomeworks = "/homeworks"; //  /homeworks {homeworkId}
        public const string GetTasks = "/task";          //  /task {taskId}
        public const string GetTaskInfo = "/taskinfo";   //  /taskinfo
        public const string GetSolutions = "/solutions";   //  /solutions {taskId}
        public const string GetSolutionInfo = "/solutioninfo";   //  /solutioninfo {solutionId}
    }
}