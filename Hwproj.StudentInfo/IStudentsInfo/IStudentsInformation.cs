using System.Collections.Generic;

namespace IStudentsInfo
{
    /// Модель, хранящая информацию о почте и ФИО студента
    public class StudentModel {
        public string Name { get; set; }
        public string Surname { get; set; }
        public string MiddleName { get; set; }
        public string Email { get; set; }
    };
    
    /// Модель, хранящая информацию об образовательной программе
    public class ProgramModel 
    {
        public string ProgramName { get; set; }
    };
    
    /// Модель, хранящая информацию об учебной группе
    public class GroupModel 
    {
        public string GroupName { get; set; }
    };
    
    /// Класс, который содержит функциональность по получению образовательных программ, учебных групп
    /// и информации о студентах
    public interface IStudentsInformationProvider
    {
        /// По данному названию образовательной программы возвращает список соответствующих учебных групп
        List<GroupModel> GetGroups(string programName);
        
        /// По данному названию учебной группы возвращает информацию о студентах в виде словаря,
        /// в котором ключи - почты студентов, значения - ФИО
        List<StudentModel> GetStudentInformation(string groupName);
        
        /// Возвращает список образовательных программ
        List<ProgramModel> GetProgramNames();
    }
}