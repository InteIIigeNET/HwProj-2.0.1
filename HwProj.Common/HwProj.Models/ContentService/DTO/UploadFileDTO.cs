using System.ComponentModel.DataAnnotations;
using HwProj.Models.ContentService.Attributes;
using Microsoft.AspNetCore.Http;

namespace HwProj.Models.ContentService.DTO
{
    public class UploadFileDTO
    {
        public long CourseId { get; set; }
        
        public long HomeworkId { get; set; }
        
        [Required]
        [MaxFileSize(100 * 1024 * 1024)]
        public IFormFile File { get; set; }
    }
}