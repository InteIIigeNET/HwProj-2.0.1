namespace HwProj.TelegramBotService.API.Commands
{
    public static class CommandNames
    {
        public const string StartCommand = "/start";
        public const string GetCourses = "/courses";                //  /courses {courseId}
        public const string GetAllCourses = "/courses_all";         //  /courses_all {courseId}
        public const string GetHomeworks = "/homeworks";            //  /homeworks {courseId}
        public const string GetTasks = "/task";                     //  /task {homeworksId}
        public const string GetTaskInfo = "/taskinfo";              //  /taskinfo {taskId}
        public const string GetSolutionsFromTask = "/solutions";    //  /solutions {taskId}
        public const string GetSolutionInfo = "/solutioninfo";      //  /solutioninfo {solutionId}
        public const string GetStatistics = "/statistics";          //  /statistics {courseId}
        public const string SendSolution = "/send_solution";    
    }
}