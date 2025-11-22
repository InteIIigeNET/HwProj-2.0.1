using System.Collections.Generic;
using HwProj.Models.ContentService.Attributes;
using Microsoft.AspNetCore.Http;

namespace HwProj.Models.ContentService.DTO
{
    public class ProcessFilesDTO
    {
        public ScopeDTO FilesScope { get; set; }
        
        public List<long> DeletingFileIds { get; set; } = new List<long>();
        
        [CorrectFileType]
        [MaxFileSize(100 * 1024 * 1024)]
        public List<IFormFile> NewFiles { get; set; } = new List<IFormFile>();
    }
}