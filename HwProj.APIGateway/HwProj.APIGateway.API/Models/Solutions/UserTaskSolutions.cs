using HwProj.Models.AuthService.DTO;
using HwProj.Models.SolutionsService;

namespace HwProj.APIGateway.API.Models.Solutions
{
    public class UserTaskSolutions
    {
        public Solution[] Solutions { get; set; }
        public AccountDataDto User { get; set; }
    }
}
