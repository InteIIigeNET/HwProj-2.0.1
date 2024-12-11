using System;
using System.Collections.Generic;
using System.Linq;
using HtmlAgilityPack;
using Novell.Directory.Ldap;

namespace StudentsInfo
{
    public class StudentsStats : IStudentsInfo.IStudentsStats
    {
        private readonly Dictionary<string, List<string>> _programsGroups = new Dictionary<string, List<string>>();
        private readonly string _ldapHost = "ad.pu.ru";
        private readonly int _ldapPort = 389;
        private readonly string _searchBase = "DC=ad,DC=pu,DC=ru";

        private string _username;
        private string _password;

        /// <inheritdoc />
        public List<string> GetGroups(string programName)
        {
            // Return the list of groups for a program, concatenated by comma and split, trimmed for extra spaces
            return _programsGroups.ContainsKey(programName)
                ? _programsGroups[programName]
                    .Aggregate((current, next) => current + "," + next) // Concatenate all groups into one string
                    .Split(',') // Split by comma
                    .Select(group => group.Trim()) // Trim any leading or trailing whitespace
                    .ToList()
                : new List<string>();
        }

        /// <inheritdoc />
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
        
        public List<string> ProgramNames => _programsGroups.Keys.ToList();
        
        public StudentsStats(string username, string password)
        {
            this._username = username;
            this._password = password;

            const string url = "https://timetable.spbu.ru/MATH?lang=ru";
            var web = new HtmlWeb();

            web.PreRequest = request =>
            {
                request.Headers.Add("Accept-Language", "ru");
                return true;
            };

            var doc = web.Load(url);
            var programNodes = doc.DocumentNode.SelectNodes("//li[contains(@class, 'common-list-item row')]");

            foreach (var programNode in programNodes)
            {
                var programNameNode = programNode.SelectSingleNode(".//div[contains(@class, 'col-sm-5')]");
                var programName = programNameNode?.InnerText.Trim();

                var titleNodes = programNode.SelectNodes(".//div[contains(@class, 'col-sm-1')]");

                if (titleNodes != null && programName != null)
                {
                    var titles = new List<string>();
                    foreach (var titleNode in titleNodes)
                    {
                        var title = titleNode.SelectSingleNode(".//a")?.Attributes["title"]?.Value;
                        if (title != null)
                        {
                            titles.Add(title);
                        }
                    }

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
