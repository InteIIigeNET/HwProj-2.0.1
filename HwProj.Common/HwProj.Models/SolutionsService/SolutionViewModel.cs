using System.ComponentModel.DataAnnotations;
using System;

namespace HwProj.Models.SolutionsService
{
    public class SolutionViewModel
    {
        public string GithubUrl { get; set; }

        public string Comment { get; set; }

        public string StudentId { get; set; }

        public DateTime PublicationDate { get; set; }

        public string LecturerComment { get; set; }

        public int? Rating { get; set; }
    }
}
