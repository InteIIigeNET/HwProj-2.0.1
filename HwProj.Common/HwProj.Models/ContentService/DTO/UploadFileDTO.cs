using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace HwProj.Models.ContentService.DTO
{
    public class UploadFileDTO
    {
        public long CourseId { get; set; }
        
        public long HomeworkId { get; set; }
        
        public IFormFile File { get; set; }
    }
}