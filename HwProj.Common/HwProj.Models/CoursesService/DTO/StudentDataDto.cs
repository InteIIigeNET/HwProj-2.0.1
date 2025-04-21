using HwProj.Models.AuthService.DTO;

namespace HwProj.Models.CoursesService.DTO
{
    public class StudentDataDto : AccountDataDto
    {
        public StudentDataDto(AccountDataDto accountData) : base(
            accountData.UserId, accountData.Name, accountData.Surname,
            accountData.Email, accountData.Role, accountData.IsExternalAuth,
            accountData.MiddleName, accountData.GithubId, accountData.CompanyName,
            accountData.Bio)
        {
        }

        public StudentCharacteristicsDto? Characteristics { get; set; }
    }

    public class StudentCharacteristicsDto
    {
        public string[] Tags { get; set; }
        public string Description { get; set; }
    }
}
