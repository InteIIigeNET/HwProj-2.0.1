using System.IO;
using System.Reflection;
using System.Threading;
using FluentAssertions;
using HwProj.PageObjects.AuthServicePageObjects;
using NUnit.Framework;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;

namespace HwProj.AuthService.SeleniumTests
{
    public class Tests
    {
        private IWebDriver _webDriver;
        private readonly string _url = "http://localhost:3000/";
        
        [SetUp]
        public void Setup()
        {
            _webDriver = new ChromeDriver(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location));
            _webDriver.Navigate().GoToUrl(_url);
        }

        [Test]
        public void SimpleLoginTest()
        {
            var mainMenu = new MainMenuPageObject(_webDriver);

            mainMenu
                .MoveToLogin()
                .Login("admin@gmail.com", "Admin@1234");

            var currentUrl = _webDriver.Url;
            
            Assert.AreEqual(_url, _webDriver.Url);
        }

        [Test]
        public void SimpleRegisterTest()
        {
            var mainMenu = new MainMenuPageObject(_webDriver);

            mainMenu
                .MoveToRegister()
                .Register("Volodya", "Petrov", "bigvova228@sobaka.com", 
                    "2281337", "2281337");
            
            var currentUrl = _webDriver.Url;
            Assert.AreEqual(_url, currentUrl);
        }
        [Test]
        public void CheckProfileTest()
        {
            var mainMenu = new MainMenuPageObject(_webDriver);

            var profileData = mainMenu
                .MoveToLogin()
                .Login("admin@gmail.com", "Admin@1234")
                .MoveToMenu()
                .MoveToProfile()
                .GetProfileData();

            profileData.Should().Contain("admin@gmail.com");
        }

        [TearDown]
        public void TearDown()
        {
            _webDriver.Quit();
        }
    }
}
