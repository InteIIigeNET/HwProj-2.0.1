using System;
using System.Linq;
using HwProj.Models.AuthService.DTO;

namespace HwProj.Models.SolutionsService
{
    public class GetSolutionModel
    {
        public GetSolutionModel(Solution model, AccountDataDto[]? groupMates)
        {
            Id = model.Id;
            GithubUrl = model.GithubUrl;
            Comment = model.Comment;
            StudentId = model.StudentId;
            GroupMates = groupMates?
                             .OrderBy(t => t.Surname)
                             .ThenBy(t => t.Name)
                             .ToArray()
                         ?? Array.Empty<AccountDataDto>();
            LecturerComment = model.LecturerComment;
            PublicationDate = model.PublicationDate;
            Rating = model.Rating;
            StudentId = model.StudentId;
            TaskId = model.TaskId;
            State = model.State;
        }

        public long Id { get; set; }

        public string GithubUrl { get; set; }

        public string Comment { get; set; }

        public SolutionState State { get; set; }

        public int Rating { get; set; }

        public string StudentId { get; set; }

        public long TaskId { get; set; }

        public DateTime PublicationDate { get; set; }

        public string LecturerComment { get; set; }

        public AccountDataDto[] GroupMates { get; set; }
    }
}
