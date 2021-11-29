using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Models
{
    public class WorkFile : IEntity<long>
    {
        public string FileName { get; set; }
        public string ContentType { get; set; }
        public byte[] Data { get; set; }

        public long CourseWorkId { get; set; }
        public CourseWork CourseWork { get; set; }

        public long FileTypeId { get; set; }
        public FileType FileType { get; set; }
        public long Id { get; set; }
    }
}
