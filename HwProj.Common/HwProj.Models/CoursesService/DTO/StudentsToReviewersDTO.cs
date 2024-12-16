using System.Collections.Generic;
using HwProj.Models.AuthService.DTO;

namespace HwProj.Models.CoursesService.DTO
{
    public class StudentsToReviewersDTO
    {
        public Dictionary<string, AccountDataDto[]> StudentsToReviewersDictionary { get; set; } =
            new Dictionary<string, AccountDataDto[]>();
    }
}