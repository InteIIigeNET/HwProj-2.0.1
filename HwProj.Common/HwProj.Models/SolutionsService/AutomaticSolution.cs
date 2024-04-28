using System;
using System.Collections.Generic;
using System.Text;

namespace HwProj.Models.SolutionsService
{
    public class AutomaticSolution
    {
        public string GithubId { get; set; }

        public string SolutionUrl { get; set; }

        public long TaskId { get; set; }
    }
}
