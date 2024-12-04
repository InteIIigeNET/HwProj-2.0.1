using System.Collections.Generic;

namespace IStudentsInfo
{
    public interface IStudentsStats
    {
        /// <summary>
        /// Given a name of a study program in English, returns a list of corresponding academic groups.
        /// </summary>
        List<string> GetGroups(string programName);

        /// <summary>
        /// Given a name of an academic group returns a list of students' STs (Student IDs).
        /// </summary>
        List<string> GetSts(string groupName);
    }
}