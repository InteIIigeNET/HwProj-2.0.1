using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HwProj.CoursesService.API.Models
{
    public class HomeworkTaskLtiLaunchData
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public long HomeworkTaskId { get; set; }

        [Required]
        public string LtiLaunchUrl { get; set; }

        /// JSON
        public string? CustomParams { get; set; }

        [ForeignKey(nameof(HomeworkTaskId))]
        public HomeworkTask HomeworkTask { get; set; }
    }
}