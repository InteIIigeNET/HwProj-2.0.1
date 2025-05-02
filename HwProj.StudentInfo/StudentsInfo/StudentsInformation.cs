using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using IStudentsInfo;
using Newtonsoft.Json;
using Novell.Directory.Ldap;
using System.Threading;

namespace StudentsInfo
{
    public class InterruptibleLazy<T>
    {
        private Func<T> _valueFactory;
        private readonly object _lockObj = new object();
        private T _value;

        public InterruptibleLazy(Func<T> valueFactory)
        {
            _valueFactory = valueFactory;
        }

        public T Value
        {
            get
            {
                if (_valueFactory == null) return _value;

                lock (_lockObj)
                {
                    if (_valueFactory == null) return _value;

                    _value = _valueFactory();
                    Interlocked.MemoryBarrier();
                    _valueFactory = null;
                }

                return _value;
            }
        }
    }

    public class StudentsInformationProvider : IStudentsInformationProvider
    {
        private readonly InterruptibleLazy<Task<Dictionary<string, List<string>>>> _programsGroups;
        private readonly string _ldapHost = "ad.pu.ru";
        private readonly int _ldapPort = 389;
        private readonly string _searchBase = "DC=ad,DC=pu,DC=ru";
        private readonly HttpClient _httpClient;

        private string _username;
        private string _password;

        public async Task<List<GroupModel>> GetGroups(string programName)
        {
            var programsGroups = await _programsGroups.Value;
            if (!programsGroups.TryGetValue(programName, out var groups))
                return new List<GroupModel>();

            return groups.Select(group => new GroupModel { GroupName = group }).ToList();
        }

        public List<StudentModel> GetStudentInformation(string groupName)
        {
            var searchFilter =
                $"(&(objectClass=person)(memberOf=CN=АкадемГруппа_{groupName},OU=АкадемГруппа,OU=Группы,DC=ad,DC=pu,DC=ru))";
            var studentsList = new List<StudentModel>();
            LdapConnection connection = null;

            try
            {
                connection = new LdapConnection();
                connection.Connect(_ldapHost, _ldapPort);
                connection.Bind(_username, _password);

                if (!connection.Connected)
                {
                    return studentsList;
                }

                var results = connection.Search(
                    _searchBase,
                    LdapConnection.SCOPE_SUB,
                    searchFilter,
                    new[] { "cn", "displayName" },
                    false
                );

                while (results.hasMore())
                {
                    var entry = results.next();
                    var cn = entry.getAttribute("cn")?.StringValue;
                    var displayName = entry.getAttribute("displayName")?.StringValue;

                    if (cn != null && displayName != null)
                    {
                        string[] splitNames = displayName.Split(' ');
                        var newStudent = new StudentModel
                        {
                            Name = splitNames[0],
                            Surname = splitNames.Length > 1 ? splitNames[1] : "",
                            MiddleName = splitNames.Length > 2 ? splitNames[2] : "",
                            Email = cn + "@student.spbu.ru"
                        };
                        studentsList.Add(newStudent);
                    }
                }
            }
            catch (LdapReferralException)
            {
                return studentsList;
            }
            catch (LdapException)
            {
                return studentsList;
            }
            catch (Exception)
            {
                return studentsList;
            }
            finally
            {
                try
                {
                    if (connection != null && connection.Connected)
                    {
                        SafeDisconnect(connection);
                    }
                }
                catch (Exception)
                {
                }
            }

            return studentsList;
        }

        private void SafeDisconnect(LdapConnection connection)
        {
            try
            {
                connection.Disconnect();
            }
            catch (PlatformNotSupportedException)
            {
            }
            catch (Exception)
            {
            }
        }

        public async Task<List<ProgramModel>> GetProgramNames()
        {
            var programGroups = await _programsGroups.Value;
            return programGroups.Keys
                .Select(key => new ProgramModel { ProgramName = key })
                .ToList();
        }

        public StudentsInformationProvider(string username, string password, string ldapHost, int ldapPort,
            string searchBase)
        {
            _username = username;
            _password = password;
            _ldapHost = ldapHost;
            _ldapPort = ldapPort;
            _searchBase = searchBase;
            _httpClient = new HttpClient();

            _programsGroups = new InterruptibleLazy<Task<Dictionary<string, List<string>>>>(async () =>
            {
                var programsGroups = new Dictionary<string, List<string>>();

                try
                {
                    var programsResponse =
                        await _httpClient.GetAsync(
                            "https://timetable.spbu.ru/api/v1/study/divisions/MATH/programs/levels");
                    if (programsResponse.IsSuccessStatusCode)
                    {
                        var content = await programsResponse.Content.ReadAsStringAsync();
                        var studyLevels = JsonConvert.DeserializeObject<List<StudyLevel>>(content);

                        foreach (var level in studyLevels)
                        {
                            foreach (var programCombination in level.StudyProgramCombinations)
                            {
                                foreach (var admissionYear in programCombination.AdmissionYears)
                                {
                                    var groupsResponse = await _httpClient.GetAsync(
                                        $"https://timetable.spbu.ru/api/v1/programs/{admissionYear.StudyProgramId}/groups");
                                    if (groupsResponse.IsSuccessStatusCode)
                                    {
                                        var groupsContent = await groupsResponse.Content.ReadAsStringAsync();
                                        var programGroups = JsonConvert.DeserializeObject<ProgramGroups>(groupsContent);

                                        var programName = programCombination.Name;
                                        var groups = programGroups.Groups.Select(g => g.StudentGroupName).ToList();

                                        if (programsGroups.ContainsKey(programName))
                                        {
                                            programsGroups[programName].AddRange(groups);
                                        }
                                        else
                                        {
                                            programsGroups[programName] = groups;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error loading programs: {ex.Message}");
                }

                return programsGroups;
            });
        }

        private class StudyLevel
        {
            public string StudyLevelName { get; set; }
            public List<StudyProgramCombination> StudyProgramCombinations { get; set; }
        }

        private class StudyProgramCombination
        {
            public string Name { get; set; }
            public List<AdmissionYear> AdmissionYears { get; set; }
        }

        private class AdmissionYear
        {
            public int StudyProgramId { get; set; }
        }

        private class ProgramGroups
        {
            public List<GroupInfo> Groups { get; set; }
        }

        private class GroupInfo
        {
            public string StudentGroupName { get; set; }
        }
    }
}
