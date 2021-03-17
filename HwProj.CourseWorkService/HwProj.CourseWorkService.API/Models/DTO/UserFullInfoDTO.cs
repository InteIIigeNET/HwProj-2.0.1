namespace HwProj.CourseWorkService.API.Models.DTO
{
    public class UserFullInfoDTO
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string MiddleName { get; set; }
        public string Email { get; set; }
        public RoleDTO[] Roles { get; set; }
        public long? DirectionId { get; set; }
        public string DirectionName { get; set; }
        public int? Group { get; set; }
        public int? Course { get; set; }
        public long? DepartmentId { get; set; }
        public string DepartmentName { get; set; }
        public string Contact { get; set; }
    }
}
