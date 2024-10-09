using System.Collections.Generic;

namespace HwProj.Models.AuthService.ViewModels
{
    public class InviteExpertViewModel
    {
        public string UserId { get; set; }

        public string UserEmail { get; set; }

        public long CourseId { get; set; }

        public List<string> StudentIds { get; set; } = new List<string>();

        public List<long> HomeworkIds { get; set; } = new List<long>();
    }
}