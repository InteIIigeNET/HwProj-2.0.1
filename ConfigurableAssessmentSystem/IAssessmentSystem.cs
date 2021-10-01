namespace ConfigurableAssessmentSystem
{
    public interface IAssessmentSystem
    {
        public int CalculateAssessmentForTask(TaskModel task,
            SolutionModel[] solutions);
    }
}