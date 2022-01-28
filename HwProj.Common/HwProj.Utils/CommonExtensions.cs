using System.Collections.Generic;
using System.Linq;

namespace HwProj.Utils
{
    public static class CommonExtensions
    {
        public static List<string> GetMentorIds(this string line)
        {   
            var ids = line.Split('/').ToList();
            return ids;
        }
    }
}
