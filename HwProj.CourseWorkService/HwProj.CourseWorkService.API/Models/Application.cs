using HwProj.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CourseWorkService.API.Models
{
    public class Application : IEntity
    {
        public long Id { get; set; }

        public string StudentId { get; set; }

        public long CourseWorkId { get; set; }

        public string Message { get; set; }

        public DateTime DateOfApplication { get; set; }
    }
}
