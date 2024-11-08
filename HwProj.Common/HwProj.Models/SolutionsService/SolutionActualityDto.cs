namespace HwProj.Models.SolutionsService
{
    public class SolutionActualityPart
    {
        public bool isActual { get; set; }
        public string Comment { get; set; }
        public string AdditionalData { get; set; }
    }

    public class SolutionActualityDto
    {
        public SolutionActualityPart? CommitsActuality { get; set; }
        public SolutionActualityPart? TestsActuality { get; set; }
    }
}
