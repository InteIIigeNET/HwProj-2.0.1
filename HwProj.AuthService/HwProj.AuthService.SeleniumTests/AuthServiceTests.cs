using System.IO;
using System.Reflection;
using System.Threading;
using HwProj.PageObjects.AuthServicePageObjects;
using NUnit.Framework;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;

namespace HwProj.AuthService.SeleniumTests
{
    public class Tests
    {
        private IWebDriver _webDriver;
        
        [SetUp]
        public void Setup()
        {
            _webDriver = new ChromeDriver(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location));
            _webDriver.Navigate().GoToUrl("http://localhost:3000");
        }

        [Test]
        public void SimpleLoginTest()
        {
            var mainMenu = new MainMenuPageObject(_webDriver);

            mainMenu
                .MoveToLogin()
                .Login("admin@gmail.com", "Admin@1234");
            
            Thread.Sleep(1000);
        }

        [Test]
        public void SimpleRegisterTest()
        {
            var mainMenu = new MainMenuPageObject(_webDriver);

            mainMenu
                .MoveToRegister()
                .Register("Volodya", "Petrov", "bigvova228@sobaka.com", 
                    "2281337", "2281337");
            
            Thread.Sleep(1000);
        }
        
        [TearDown]
        public void TearDown()
        {
            _webDriver.Quit();
        }
    }
}
