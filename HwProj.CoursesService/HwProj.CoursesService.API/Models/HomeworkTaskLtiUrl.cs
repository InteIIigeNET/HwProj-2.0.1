using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HwProj.CoursesService.API.Models
{
    public class HomeworkTaskLtiUrl
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public long TaskId { get; set; }

        [Required]
        public string LtiLaunchUrl { get; set; }

        public int ToolId { get; set; }
    }
}