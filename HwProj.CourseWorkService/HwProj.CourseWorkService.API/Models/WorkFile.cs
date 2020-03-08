using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Models
{
    public class WorkFile : IEntity
    {
        public long Id { get; set; }

        public string Type { get; set; }
        public bool IsFile { get; set; }

        public string ReferenceOnFile { get; set; }

        public string FileName { get; set; }
        public string FileType { get; set; }
        public byte[] Data { get; set; }

        public long CourseWorkId { get; set; }
        public CourseWork CourseWork { get; set; }
    }
}
