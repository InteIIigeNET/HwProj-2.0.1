namespace ConfigurableAssessmentSystem
{
    public interface IAssessmentSystem
    {
        public int CalculateAssessmentForTask(TaskForAssessmentModel task,
            SolutionForAssessmentModel[] solutions);
    }
}