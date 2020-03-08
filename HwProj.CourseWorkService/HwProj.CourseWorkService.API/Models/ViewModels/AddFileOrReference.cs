using Microsoft.AspNetCore.Http;

namespace HwProj.CourseWorkService.API.Models.ViewModels
{
    public class AddFileOrReference
    {
        public long CourseWorkId { get; set; }
        public string Type { get; set; }
        public bool IsFile { get; set; }

        public string ReferenceOnFile { get; set; }

        public IFormFile FData { get; set; }
    }
}
