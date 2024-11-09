using System;
using System.Collections.Generic;
using System.Linq;
using HtmlAgilityPack;
using Novell.Directory.Ldap;

namespace StudentsInfo
{
    public class StudentsStats
    {
        private readonly Dictionary<string, List<string>> _programsGroups = new Dictionary<string, List<string>>();
        private readonly string _ldapHost = "ad.pu.ru";
        private readonly int _ldapPort = 389;
        private readonly string _searchBase = "DC=ad,DC=pu,DC=ru";
        
        private string _username;
        private string _password;

        /// <summary>
        /// Given a name of a study program in English, returns a list of corresponding academic groups
        /// </summary>
        public List<string> GetGroups(string programName)
        {
            return _programsGroups.ContainsKey(programName) ? _programsGroups[programName] : new List<string>();
        }
        
        /// <summary>
        /// Given a name of an academic group returns a list of students' STs (Student IDs)
        /// </summary>
        public List<string> GetSts(string groupName)
        {
            var searchFilter = $"(&(objectClass=person)(memberOf=CN=АкадемГруппа_{groupName},OU=АкадемГруппа,OU=Группы,DC=ad,DC=pu,DC=ru))";
            var cnList = new List<string>();

            try
            {
                var connection = new LdapConnection();
                connection.Connect(_ldapHost, _ldapPort);
                connection.Bind(_username, _password);

                var results = connection.Search(
                    _searchBase,
                    LdapConnection.SCOPE_SUB,
                    searchFilter,
                    new[] { "cn" }, 
                    false
                );

                while (results.hasMore())
                {
                    var entry = results.next();
                    cnList.Add(entry.getAttribute("cn").StringValue);
                }
        
                connection.Disconnect();
            }
            catch (LdapReferralException)
            {
                // Handle exception if needed
            }

            return cnList;
        }

        public StudentsStats(string username, string password)
        {
            this._username = username;
            this._password = password;

            // Fetch programs and corresponding groups from the timetable
            const string url = "https://timetable.spbu.ru/MATH";
            var web = new HtmlWeb();
            var doc = web.Load(url);
            
            // Select all list items containing 'Software Engineering' (case-insensitive)
            var programNodes = doc.DocumentNode.SelectNodes("//li[contains(@class, 'common-list-item row')]");

            // Filter only 'Software Engineering' programs (case-insensitive)
            var softwareEngineeringPrograms = programNodes
                .Where(node => node.InnerText.Contains("Software Engineering", StringComparison.OrdinalIgnoreCase))
                .ToList();

            // Process each 'Software Engineering' program
            foreach (var programNode in softwareEngineeringPrograms)
            {
                var programNameNode = programNode.SelectSingleNode(".//div[contains(@class, 'col-sm-5')]");
                var programName = programNameNode?.InnerText.Trim();

                var titleNodes = programNode.SelectNodes(".//div[contains(@class, 'col-sm-1')]");

                if (titleNodes != null && programName != null)
                {
                    var titles = new List<string>();

                    // Collect all group titles
                    foreach (var titleNode in titleNodes)
                    {
                        var title = titleNode.SelectSingleNode(".//a")?.Attributes["title"]?.Value;
                        if (title != null)
                        {
                            titles.Add(title);
                        }
                    }

                    // If the program already exists, append the new titles
                    if (_programsGroups.ContainsKey(programName))
                    {
                        _programsGroups[programName].AddRange(titles);
                    }
                    else
                    {
                        _programsGroups[programName] = titles;
                    }
                }
            }
        }
    }
}