using NUnit.Framework;
using System.Linq;

namespace StudentsInfo.Tests
{
    [TestFixture]
    public class StudentsInformationTests
    {
        private const string TestLogin = "";
        private const string TestPassword = "";
        private const string TestLdapHost = "ad.pu.ru";
        private const int TestLdapPort = 389;
        private const string TestSearchBase = "DC=ad,DC=pu,DC=ru";
        private StudentsInformationProvider _studentsInformation;
        
        [SetUp]
        public void SetUp()
        {
            _studentsInformation = new StudentsInformationProvider(TestLogin, TestPassword, TestLdapHost,
                TestLdapPort, TestSearchBase);
        }

        [Test]
        public void Constructor_ShouldPopulateProgramGroups()
        {
            var programNamesModels = _studentsInformation.GetProgramNames();
            var programNames = programNamesModels.Select(model => model.ProgramName).ToList();
            
            Assert.IsNotEmpty(programNames);
            Assert.Contains("Программная инженерия", programNames); 
            Assert.Contains("Технологии программирования", programNames); 
        }

        [Test]
        public void GetGroups_ShouldReturnGroups_WhenProgramNameExists()
        {
            string programName = "Программная инженерия";
            
            var groupsModels = _studentsInformation.GetGroups(programName);
            var groups = groupsModels.Select(model => model.GroupName).ToList();
            
            Assert.IsNotEmpty(groups);
            Assert.Contains("22.Б11-мм", groups);
            Assert.Contains("22.Б15-мм", groups);
        }

        [Test]
        public void GetGroups_ShouldReturnEmptyList_WhenProgramNameDoesNotExist()
        {
            string programName = "Экономика";
            
            var groups = _studentsInformation.GetGroups(programName);
            
            Assert.IsEmpty(groups);
        }
        
        [Test]
        public void GetStudentsInformation_ShouldReturnStudentsInformation_IfGroupNameExists()
        {
            Assume.That(!string.IsNullOrEmpty(TestLogin), "Логин не был указан");
            Assume.That(!string.IsNullOrEmpty(TestPassword), "Пароль не был указан");
            string programName = "Экономика";
            
            var groups = _studentsInformation.GetGroups(programName);

            Assert.IsEmpty(groups);
        }
        
        // Для тестирования получения данных по LDAP необходимо указать st-почту и пароль (TestLogin, TestPassword)
        [Test]
        public void GetStudentsInformation_ShouldReturnNonEmptyDictionary_IfGroupNameExists()
        {
            Assume.That(!string.IsNullOrEmpty(TestLogin), "Логин не был указан");
            Assume.That(!string.IsNullOrEmpty(TestPassword), "Пароль не был указан");

            Assert.AreEqual(_studentsInformation.GetStudentInformation("22.Б11-мм").Count, 37);
        }
        
        [Test]
        public void GetStudentsInformation_ShouldReturnEmptyDictionary_IfGroupNameDoesntExists()
        {
            Assume.That(!string.IsNullOrEmpty(TestLogin), "Логин не был указан");
            Assume.That(!string.IsNullOrEmpty(TestPassword), "Пароль не был указан");

            Assert.AreEqual(_studentsInformation.GetStudentInformation("Группа").Count, 0);
        }
    }
}