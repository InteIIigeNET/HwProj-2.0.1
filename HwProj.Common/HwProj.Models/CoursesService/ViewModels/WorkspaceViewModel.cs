using System.Collections.Generic;
using HwProj.Models.AuthService.DTO;

namespace HwProj.Models.CoursesService.ViewModels
{
    public class WorkspaceViewModel
    {
        public AccountDataDto[] Students { get; set; }

        public HomeworkViewModel[] Homeworks { get; set; }
    }
}