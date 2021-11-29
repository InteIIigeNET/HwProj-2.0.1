using System.Collections.Generic;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Models
{
    public enum FileTypes
    {
        CourseWorkText = 1,
        Presentation,
        Review,
        LecturerComment,
        Other
    }

    public class FileType : IEntity<long>
    {
        public FileType()
        {
            Files = new List<WorkFile>();
        }

        public string DisplayValue { get; set; }
        public List<WorkFile> Files { get; set; }
        public long Id { get; set; }
    }
}
