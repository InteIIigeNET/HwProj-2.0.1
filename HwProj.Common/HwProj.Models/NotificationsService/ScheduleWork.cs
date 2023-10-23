namespace HwProj.Models.NotificationsService
{
    public class ScheduleWork
    {
        private long _taskId;
        private long _homeworkId;
        private long _courseId;

        public long? TaskId
        {
            get => _taskId;
            set => _taskId = value ?? -1;
        }

        public long? HomeworkId
        {
            get => _homeworkId;
            set => _homeworkId = value ?? -1;
        }

        public long? CourseId
        {
            get => _courseId;
            set => _courseId = value ?? -1;
        }

        public string CategoryId { get; set; }

        public string JobId { get; set; }
    }
}