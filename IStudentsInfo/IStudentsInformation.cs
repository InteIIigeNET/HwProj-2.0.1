using System.Collections.Generic;

namespace IStudentsInfo
{
    /// <summary>
    /// Модель, хранящая информацию о почте и ФИО студента
    /// </summary>
    public class StudentModel {
        public string Name { get; set; }
        public string Surname { get; set; }
        public string MiddleName { get; set; }
        public string Email { get; set; }
    };
    
    /// <summary>
    /// Модель, хранящая информацию об образовательной программе
    /// </summary>
    public class ProgramModel 
    {
        public string ProgramName { get; set; }
    };
    
    /// <summary>
    /// Модель, хранящая информацию об учебной группе
    /// </summary>
    public class GroupModel 
    {
        public string GroupName { get; set; }
    };
    
    /// <summary>
    /// Класс, который содержит функциональность по получению образовательных программ, учебных групп
    /// и информации о студентах
    /// </summary>
    public interface IStudentsInformation
    {
        /// <summary>
        /// По данному названию образовательной программы возвращает список соответствующих учебных групп
        /// </summary>
        List<GroupModel> GetGroups(string programName);

        /// <summary>
        /// По данному названию учебной группы возвращает информацию о студентах в виде словаря,
        /// в котором ключи - почты студентов, значения - ФИО
        /// </summary>
        List<StudentModel> GetStudentInformation(string groupName);

        /// <summary>
        /// Возвращает список образовательных программ
        /// </summary>
        List<ProgramModel> GetProgramNames();
    }
}