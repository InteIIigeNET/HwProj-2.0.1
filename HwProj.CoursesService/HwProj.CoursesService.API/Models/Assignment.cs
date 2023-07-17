using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Models;

public class Assignment : IEntity<long>
{
    [Key] 
    public long Id { get; set; }

    public long CourseId { get; set }

    public string MentorId { get; set; }

    public string StudentId { get; set; }
}