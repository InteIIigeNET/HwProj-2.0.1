using NUnit.Framework;
using System.Linq;
using System.Threading.Tasks;

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
            _studentsInformation =
                new StudentsInformationProvider(TestLogin, TestPassword, TestLdapHost, TestLdapPort, TestSearchBase);
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
        public async Task GetGroups_ShouldReturnGroups_WhenProgramNameExists()
        {
            string programName = "Программная инженерия";

            var groupsModels = await _studentsInformation.GetGroups(programName);
            var groups = groupsModels.Select(model => model.GroupName).ToList();

            Assert.IsNotEmpty(groups);
            Assert.Contains("22.Б11-мм", groups);
            Assert.Contains("22.Б15-мм", groups);
        }

        [Test]
        public async Task GetGroups_ShouldReturnEmptyList_WhenProgramNameDoesNotExist()
        {
            string programName = "Экономика";

            var groups = await _studentsInformation.GetGroups(programName);

            Assert.IsEmpty(groups);
        }

        [Test]
        public async Task GetStudentsInformation_ShouldReturnStudentsInformation_IfGroupNameExists()
        {
            Assume.That(!string.IsNullOrEmpty(TestLogin), "Логин не был указан");
            Assume.That(!string.IsNullOrEmpty(TestPassword), "Пароль не был указан");
            string programName = "Экономика";

            var groups = await _studentsInformation.GetGroups(programName);

            Assert.IsEmpty(groups);
        }

        [Test]
        public void GetStudentsInformation_ShouldReturnNonEmptyDictionary_IfGroupNameExists()
        {
            Assume.That(!string.IsNullOrEmpty(TestLogin), "Логин не был указан");
            Assume.That(!string.IsNullOrEmpty(TestPassword), "Пароль не был указан");

            var studentInfo = _studentsInformation.GetStudentInformation("22.Б11-мм");
            Assert.AreEqual(37, studentInfo.Count);
        }

        [Test]
        public void GetStudentsInformation_ShouldReturnEmptyDictionary_IfGroupNameDoesntExists()
        {
            Assume.That(!string.IsNullOrEmpty(TestLogin), "Логин не был указан");
            Assume.That(!string.IsNullOrEmpty(TestPassword), "Пароль не был указан");

            var studentInfo = _studentsInformation.GetStudentInformation("Группа");
            Assert.AreEqual(0, studentInfo.Count);
        }
    }
}
