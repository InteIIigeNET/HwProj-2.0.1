namespace HwProj.Models.AuthService
{
    public class StudentsModel
    {
        public string[] Students { get; set; }

        public StudentsModel(string[] students)
        {
            Students = students;
        }
    }
}
