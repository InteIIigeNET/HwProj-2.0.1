using System;
using System.IO;
using System.Net.Mail;
using System.Reflection;
using AutoFixture;
using FluentAssertions;
using HwProj.PageObjects;
using HwProj.PageObjects.AuthServicePageObjects;
using NUnit.Framework;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;

namespace HwProj.AuthService.SeleniumTests
{
    public class Tests
    {
        private IWebDriver _webDriver;
        private readonly string _url = "http://localhost:3000";

        [SetUp]
        public void Setup()
        {
            _webDriver = new ChromeDriver(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location));
            _webDriver.Navigate().GoToUrl(_url);
        }

        [Test]
        public void RegisterTest()
        {
            var mainMenu = new MainMenuPageObject(_webDriver);
            var name = new Fixture().Create<string>().Substring(0,6);;
            var surname = new Fixture().Create<string>().Substring(0,6);;
            var middleName = new Fixture().Create<string>().Substring(0,6);;
            var email = new Fixture().Create<MailAddress>().Address;
            var password = new Fixture().Create<string>().Substring(0,6);;

            mainMenu
                .MoveToRegister()
                .Register(name, surname, email, password, password, middleName);

            WaitUntil.WaitLocation(_webDriver, _url, 5);

            var currentUrl = _webDriver.Url;
            Console.WriteLine(currentUrl + " no way");
            currentUrl.Should().Contain(_url);
        }
        
        [Test]
        public void LoginTest()
        {
            var mainMenu = new MainMenuPageObject(_webDriver);

            mainMenu
                .MoveToLogin()
                .Login("admin@gmail.com", "Admin@1234");

            WaitUntil.WaitLocation(_webDriver, _url, 5);

            var currentUrl = _webDriver.Url;
            currentUrl.Should().Be(_url);
        }
        
        [Test]
        public void TryLoginUnregisteredUserTest()
        {
            var mainMenu = new MainMenuPageObject(_webDriver);
            var email = new Fixture().Create<MailAddress>().Address;
            var password = new Fixture().Create<string>().Substring(0,6);
            
            mainMenu
                .MoveToLogin()
                .Login(email, password);

            var result = new LoginPageObject(_webDriver).GetResult();
            
            result.Should().Be("Пользователь не найден");
        }

        [Test]
        public void TryLoginWithIncorrectPasswordTest()
        {
            var mainMenu = new MainMenuPageObject(_webDriver);
            var name = new Fixture().Create<string>().Substring(0,6);;
            var surname = new Fixture().Create<string>().Substring(0,6);;
            var middleName = new Fixture().Create<string>().Substring(0,6);;
            var email = new Fixture().Create<MailAddress>().Address;
            var password = new Fixture().Create<string>().Substring(0,6);;
            var incorrectPassword = new Fixture().Create<string>().Substring(0,6);
            
            mainMenu
                .MoveToRegister()
                .Register(name, surname, email, password, password, middleName)
                .MoveToMenu()
                .SignOff()
                .MoveToLogin()
                .Login(email, incorrectPassword);

            var result = new LoginPageObject(_webDriver).GetResult();
            
            result.Should().Be("Неправильный логин или пароль");
        }
        
        [Test]
        public void EditAccountDataTest()
        {
            var mainMenu = new MainMenuPageObject(_webDriver);
            var name = new Fixture().Create<string>().Substring(0,6);
            var surname = new Fixture().Create<string>().Substring(0,6);
            var middleName = new Fixture().Create<string>().Substring(0,6);
            var email = new Fixture().Create<MailAddress>().Address;
            var password = new Fixture().Create<string>().Substring(0,6);

            var newName = new Fixture().Create<string>().Substring(0,6);
            var newSurname = new Fixture().Create<string>().Substring(0,6);
            var newMiddleName = new Fixture().Create<string>().Substring(0,6);

            var profileData = mainMenu
                .MoveToRegister()
                .Register(name, surname, email, password, password, middleName)
                .MoveToMenu()
                .MoveToEditProfile()
                .EditProfile(newName, newSurname, password, newMiddleName, password)
                .MoveToMenu()
                .MoveToProfile()
                .GetProfileData()
                .Split(" ");
            
            profileData[0].Should().Be(newName);
            profileData[1].Should().Be(newMiddleName);
            profileData[2].Should().Be(newSurname);
        }
        
        [Test]
        public void EditPasswordTest()
        {
            var mainMenu = new MainMenuPageObject(_webDriver);
            var name = new Fixture().Create<string>().Substring(0,6);
            var surname = new Fixture().Create<string>().Substring(0,6);
            var middleName = new Fixture().Create<string>().Substring(0,6);
            var email = new Fixture().Create<MailAddress>().Address;
            var password = new Fixture().Create<string>().Substring(0,6);

            var newPassword = new Fixture().Create<string>().Substring(0,6);

            mainMenu
                .MoveToRegister()
                .Register(name, surname, email, password, password, middleName)
                .MoveToMenu()
                .MoveToEditProfile()
                .EditProfile(name, surname, password, middleName, newPassword)
                .MoveToMenu()
                .SignOff()
                .MoveToLogin()
                .Login(email, newPassword);
            
            WaitUntil.WaitLocation(_webDriver, _url, 5);

            var currentUrl = _webDriver.Url;
            Console.WriteLine(currentUrl + " no way");
            currentUrl.Should().Contain(_url);
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
