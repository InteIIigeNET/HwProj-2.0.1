﻿using System;
using System.Collections.Generic;
using System.Linq;
using HtmlAgilityPack;
using Novell.Directory.Ldap;
using IStudentsInfo;

namespace StudentsInfo
{
    public class StudentsInformationProvider : IStudentsInformationProvider
    {
        private readonly Dictionary<string, List<string>> _programsGroups = new Dictionary<string, List<string>>();
        private readonly string _ldapHost = "ad.pu.ru";
        private readonly int _ldapPort = 389;
        private readonly string _searchBase = "DC=ad,DC=pu,DC=ru";

        private string _username;
        private string _password;
        
        public List<GroupModel> GetGroups(string programName)
        {
            return _programsGroups.ContainsKey(programName)
                ? _programsGroups[programName]
                    .Aggregate((current, next) => current + "," + next) 
                    .Split(',')
                    .Select(group => new GroupModel { GroupName = group.Trim() })
                    .ToList()
                : new List<GroupModel>();
        }
        
        public List<StudentModel> GetStudentInformation(string groupName)
        {
            // Формируем фильтр для поиска студентов в LDAP.
            var searchFilter = $"(&(objectClass=person)(memberOf=CN=АкадемГруппа_{groupName},OU=АкадемГруппа,OU=Группы,DC=ad,DC=pu,DC=ru))";
            var studentsList = new List<StudentModel>();
            
            try
            {
                // Создаем подключение к LDAP серверу.
                var connection = new LdapConnection();
                connection.Connect(_ldapHost, _ldapPort);
                connection.Bind(_username, _password);

                // Выполняем поиск по LDAP с заданным фильтром.
                var results = connection.Search(
                    _searchBase,
                    LdapConnection.SCOPE_SUB,
                    searchFilter,
                    new[] { "cn", "displayName" }, // Получаем атрибуты "cn" (st студента) и "displayName" (ФИО студента)
                    false
                );

                // Проходим по результатам поиска.
                while (results.hasMore())
                {
                    var entry = results.next();
                    var cn = entry.getAttribute("cn")?.StringValue;
                    var displayName = entry.getAttribute("displayName")?.StringValue;
                    
                    if (cn != null && displayName != null)
                    {
                        string[] splitNames = displayName.Split(' ');
                        var newStudent = new StudentModel();
                        newStudent.Name = splitNames[0];
                        newStudent.Surname = splitNames.Length > 1 ? splitNames[1] : "";
                        newStudent.MiddleName = splitNames.Length > 2 ? splitNames[2] : "";
                        newStudent.Email = cn + "@student.spbu.ru";
                        studentsList.Add(newStudent);
                    }
                }
                
                connection.Disconnect();
            }
            catch (LdapReferralException)
            {
            }

            return studentsList;
        }
        
        public List<ProgramModel> GetProgramNames()
        {
            return _programsGroups.Keys
                .Select(key => new ProgramModel { ProgramName = key })
                .ToList();
        }

        public StudentsInformationProvider(string username, string password)
        {
            this._username = username;
            this._password = password;

            try
            {
                const string url = "https://timetable.spbu.ru/MATH?lang=ru";
                var web = new HtmlWeb();

                web.PreRequest = request =>
                {
                    request.Headers.Add("Accept-Language", "ru");
                    return true;
                };

                // Загружаем HTML-страницу расписания.
                var doc = web.Load(url);
                var programNodes = doc.DocumentNode.SelectNodes("//li[contains(@class, 'common-list-item row')]");

                // Проходим по всем найденным программам.
                foreach (var programNode in programNodes)
                {
                    var programNameNode = programNode.SelectSingleNode(".//div[contains(@class, 'col-sm-5')]");
                    var programName = programNameNode?.InnerText.Trim();

                    var titleNodes = programNode.SelectNodes(".//div[contains(@class, 'col-sm-1')]");

                    if (titleNodes != null && programName != null)
                    {
                        var titles = new List<string>();
                        // Получаем все названия групп по этой программе.
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
            catch (Exception ex)
            {
            }
        }
    }
}