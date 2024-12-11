using System.Collections.Generic;

namespace IStudentsInfo
{
    public interface IStudentsStats
    {
        /// <summary>
        /// Given a name of a study program in English, returns a list of corresponding academic groups
        /// </summary>
        List<string> GetGroups(string programName);

        /// <summary>
        /// Given a name of an academic group returns a list of students' STs (Student IDs)
        /// </summary>
        Dictionary<string, string> GetStudentInformation(string groupName);
        
        /// <summary>
        /// Returns study program names
        /// </summary>
        List<string> ProgramNames { get; }
    }
}