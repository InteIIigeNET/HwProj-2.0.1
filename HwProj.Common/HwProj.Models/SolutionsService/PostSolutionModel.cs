using System;

namespace HwProj.Models.SolutionsService
{
    public class PostSolutionModel
    {
        public PostSolutionModel(SolutionViewModel model)
        {
            Id = model.Id;
            GithubUrl = model.GithubUrl;
            Comment = model.Comment;
            StudentId = model.StudentId;
            PublicationDate = model.PublicationDate;
            LecturerComment = model.LecturerComment;
            Rating = model.Rating;
        }

        public PostSolutionModel()
        {
        }

        public long Id { get; set; }

        public string GithubUrl { get; set; }

        public string Comment { get; set; }

        public string StudentId { get; set; }

        public long? GroupId { get; set; }

        public DateTime PublicationDate { get; set; }

        public string LecturerComment { get; set; }

        public int? Rating { get; set; }

        public bool IsAutomatic { get; set; }
    }
}
