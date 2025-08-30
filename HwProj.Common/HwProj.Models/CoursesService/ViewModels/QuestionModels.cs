namespace HwProj.Models.CoursesService.ViewModels
{
    public class AddTaskQuestionDto
    {
        public long TaskId { get; set; }
        public string Text { get; set; }
        public bool IsPrivate { get; set; }
    }

    public class AddAnswerForQuestionDto
    {
        public long QuestionId { get; set; }
        public string Answer { get; set; }
    }

    public class GetTaskQuestionDto
    {
        public long Id { get; set; }
        public string StudentId { get; set; }
        public string Text { get; set; }
        public bool IsPrivate { get; set; }
        public string? Answer { get; set; }
        public string? LecturerId { get; set; }
    }

    public class QuestionsSummary
    {
        public long TaskId { get; set; }
        public string TaskTitle { get; set; }
        public int Count { get; set; }
    }
}
