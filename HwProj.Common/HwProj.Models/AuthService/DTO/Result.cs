
namespace HwProj.Models.AuthService.DTO
{
    public class Result
    {
        public Result(bool succeed, string[] errors)
        {
            Succeed = succeed;
            Errors = errors;
        }

        public bool Succeed { get; }

        public string[] Errors;
    }
}