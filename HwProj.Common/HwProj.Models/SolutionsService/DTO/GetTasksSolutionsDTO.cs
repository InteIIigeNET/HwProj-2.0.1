namespace HwProj.Models.SolutionsService.DTO
{
    public class GetTasksSolutionsDTO
    {
        public long[] TaskIds { get; set; }

        public string[]? StudentIds { get; set; }
    }
}