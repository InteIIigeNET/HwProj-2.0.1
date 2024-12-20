using System.Collections.Generic;

namespace IStudentsInfo
{
    /// <summary>
    /// Класс, который содержит функциональность по получению образовательных программ, учебных групп
    /// и информации о студентах
    /// </summary>
    public interface IStudentsInformation
    {
        /// <summary>
        /// По данному названию образовательной программы возвращает список соответствующих учебных групп
        /// </summary>
        List<string> GetGroups(string programName);

        /// <summary>
        /// По данному названию учебной группы возвращает информацию о студентах в виде словаря,
        /// в котором ключи - почты студентов, значения - ФИО
        /// </summary>
        Dictionary<string, string> GetStudentInformation(string groupName);
        
        /// <summary>
        /// Возвращает список образовательных программ
        /// </summary>
        List<string> ProgramNames { get; }
    }
}