using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.Models.CoursesService.DTO
{
    public class GroupMateDataDTO
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string MiddleName { get; set; }

        public GroupMateDataDTO(string id, string name, string surname, string middleName = "")
        {
            Id = id;
            Name = name;
            Surname = surname;
            MiddleName = middleName;
        }
    }
}
