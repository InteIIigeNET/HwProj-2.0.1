namespace HwProj.Models.SolutionsService
{
    public class GetTasksSolutionsModel
    {
        public long[] TaskIds { get; set; }
        public string[]? StudentIds { get; set; }
    }
}