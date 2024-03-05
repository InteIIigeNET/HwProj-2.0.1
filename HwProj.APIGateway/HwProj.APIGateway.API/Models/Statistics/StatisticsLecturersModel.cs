using HwProj.Models.AuthService.DTO;

namespace HwProj.APIGateway.API.Models.Statistics
{
    public class StatisticsLecturersModel
    {
        public AccountDataDto Lecturer { get; set; }
        public int NumberOfCheckedSolutions { get; set; }
    }
}
