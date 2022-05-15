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
        private readonly string _url = "http://localhost:3000/";

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
            var name = new Fixture().Create<string>().Substring(0, 6);
            var surname = new Fixture().Create<string>().Substring(0, 6);
            var middleName = new Fixture().Create<string>().Substring(0, 6);
            var email = new Fixture().Create<MailAddress>().Address;
            var password = new Fixture().Create<string>().Substring(0, 6);

            mainMenu
                .MoveToRegister()
                .Register(name, surname, email, password, password, middleName);

            WaitUntil.WaitLocation(_webDriver, _url, 5);
            
            var currentUrl = _webDriver.Url;
            currentUrl.Should().Be(_url);
        }

        [Test]
        public void RegisterUserTwiceTest()
        {
            var mainMenu = new MainMenuPageObject(_webDriver);
            var name = new Fixture().Create<string>().Substring(0, 6);
            var surname = new Fixture().Create<string>().Substring(0, 6);
            var middleName = new Fixture().Create<string>().Substring(0, 6);
            var email = new Fixture().Create<MailAddress>().Address;
            var password = new Fixture().Create<string>().Substring(0, 6);

            mainMenu
                .MoveToRegister()
                .Register(name, surname, email, password, password, middleName)
                .MoveToMenu()
                .SignOff()
                .MoveToRegister()
                .Register(name, surname, email, password, password, middleName);

            var result = new RegisterPageObject(_webDriver).GetResult();

            result.Should().Be("Пользователь уже зарегистрирован");
        }

        [Test]
        public void RegisterUserWithDifferentPasswordsTest()
        {
            var mainMenu = new MainMenuPageObject(_webDriver);
            var name = new Fixture().Create<string>().Substring(0, 6);
            var surname = new Fixture().Create<string>().Substring(0, 6);
            var middleName = new Fixture().Create<string>().Substring(0, 6);
            var email = new Fixture().Create<MailAddress>().Address;
            var password = new Fixture().Create<string>().Substring(0, 6);
            var confirmPassword = new Fixture().Create<string>().Substring(0, 6);

            mainMenu
                .MoveToRegister()
                .Register(name, surname, email, password, confirmPassword, middleName);

            var result = new RegisterPageObject(_webDriver).GetResult();

            result.Should().Be("Пароли не совпадают");
        }

        [Test]
        public void LoginTest()
        {
            var mainMenu = new MainMenuPageObject(_webDriver);
            var name = new Fixture().Create<string>().Substring(0, 6);
            var surname = new Fixture().Create<string>().Substring(0, 6);
            var middleName = new Fixture().Create<string>().Substring(0, 6);
            var email = new Fixture().Create<MailAddress>().Address;
            var password = new Fixture().Create<string>().Substring(0, 6);

            mainMenu
                .MoveToRegister()
                .Register(name, surname, email, password, password, middleName)
                .MoveToMenu()
                .SignOff()
                .MoveToLogin()
                .Login(email, password);

            WaitUntil.WaitLocation(_webDriver, _url, 5);

            var currentUrl = _webDriver.Url;
            currentUrl.Should().Be(_url);
        }

        [Test]
        public void LoginUnregisteredUserTest()
        {
            var mainMenu = new MainMenuPageObject(_webDriver);
            var email = new Fixture().Create<MailAddress>().Address;
            var password = new Fixture().Create<string>().Substring(0, 6);

            mainMenu
                .MoveToLogin()
                .Login(email, password);

            var result = new LoginPageObject(_webDriver).GetResult();

            result.Should().Be("Пользователь не найден");
        }

        [Test]
        public void LoginWithIncorrectPasswordTest()
        {
            var mainMenu = new MainMenuPageObject(_webDriver);
            var name = new Fixture().Create<string>().Substring(0, 6);
            var surname = new Fixture().Create<string>().Substring(0, 6);
            var middleName = new Fixture().Create<string>().Substring(0, 6);
            var email = new Fixture().Create<MailAddress>().Address;
            var password = new Fixture().Create<string>().Substring(0, 6);
            var incorrectPassword = new Fixture().Create<string>().Substring(0, 6);

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
            var name = new Fixture().Create<string>().Substring(0, 6);
            var surname = new Fixture().Create<string>().Substring(0, 6);
            var middleName = new Fixture().Create<string>().Substring(0, 6);
            var email = new Fixture().Create<MailAddress>().Address;
            var password = new Fixture().Create<string>().Substring(0, 6);

            var newName = new Fixture().Create<string>().Substring(0, 6);
            var newSurname = new Fixture().Create<string>().Substring(0, 6);
            var newMiddleName = new Fixture().Create<string>().Substring(0, 6);

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
            var name = new Fixture().Create<string>().Substring(0, 6);
            var surname = new Fixture().Create<string>().Substring(0, 6);
            var middleName = new Fixture().Create<string>().Substring(0, 6);
            var email = new Fixture().Create<MailAddress>().Address;
            var password = new Fixture().Create<string>().Substring(0, 6);

            var newPassword = new Fixture().Create<string>().Substring(0, 6);

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

            currentUrl.Should().Be(_url);
        }

        [Test]
        public void EditAccountDataWithIncorrectCurrentPasswordTest()
        {
            var mainMenu = new MainMenuPageObject(_webDriver);
            var name = new Fixture().Create<string>().Substring(0, 6);
            var surname = new Fixture().Create<string>().Substring(0, 6);
            var middleName = new Fixture().Create<string>().Substring(0, 6);
            var email = new Fixture().Create<MailAddress>().Address;
            var password = new Fixture().Create<string>().Substring(0, 6);

            var newName = new Fixture().Create<string>().Substring(0, 6);
            var newSurname = new Fixture().Create<string>().Substring(0, 6);
            var newMiddleName = new Fixture().Create<string>().Substring(0, 6);
            var newPassword = new Fixture().Create<string>().Substring(0, 6);

            mainMenu
                .MoveToRegister()
                .Register(name, surname, email, password, password, middleName)
                .MoveToMenu()
                .MoveToEditProfile()
                .EditProfile(newName, newSurname, newPassword, newMiddleName, newPassword);

            var result = new EditProfilePageObject(_webDriver).GetResult();
            result.Should().Be("Неправильный логин или пароль");

            var newMainMenu = new MainMenuPageObject(_webDriver);

            newMainMenu
                .MoveToMenu()
                .SignOff()
                .MoveToLogin()
                .Login(email, newPassword);

            var loginResult = new LoginPageObject(_webDriver).GetResult();
            loginResult.Should().Be("Неправильный логин или пароль");
        }

        [Test]
        public void InviteNewLecturerTest()
        {
            var mainMenu = new MainMenuPageObject(_webDriver);
            var name = new Fixture().Create<string>().Substring(0, 6);
            var surname = new Fixture().Create<string>().Substring(0, 6);
            var middleName = new Fixture().Create<string>().Substring(0, 6);
            var email = new Fixture().Create<MailAddress>().Address;
            var password = new Fixture().Create<string>().Substring(0, 6);

            mainMenu
                .MoveToRegister()
                .Register(name, surname, email, password, password, middleName)
                .MoveToMenu()
                .SignOff()
                .MoveToLogin()
                .Login("admin@gmail.com", "Admin@1234")
                .MoveToMenu()
                .MoveToInviteLecturer()
                .InviteLecturer(email);

            var result = new InviteLecturerPageObject(_webDriver).GetSuccess();

            result.Should().Be("Запрос отправлен");
        }

        [Test]
        public void InviteOneLecturerTwoTimes()
        {
            var mainMenu = new MainMenuPageObject(_webDriver);
            var name = new Fixture().Create<string>().Substring(0, 6);
            var surname = new Fixture().Create<string>().Substring(0, 6);
            var middleName = new Fixture().Create<string>().Substring(0, 6);
            var email = new Fixture().Create<MailAddress>().Address;
            var password = new Fixture().Create<string>().Substring(0, 6);

            mainMenu
                .MoveToRegister()
                .Register(name, surname, email, password, password, middleName)
                .MoveToMenu()
                .SignOff()
                .MoveToLogin()
                .Login("admin@gmail.com", "Admin@1234")
                .MoveToMenu()
                .MoveToInviteLecturer()
                .InviteLecturer(email);

            var result = new InviteLecturerPageObject(_webDriver).GetSuccess();
            result.Should().Be("Запрос отправлен");

            var inviteResult = new InviteLecturerPageObject(_webDriver)
                .Close()
                .MoveToMenu()
                .MoveToInviteLecturer()
                .InviteLecturer(email)
                .GetError();

            inviteResult.Should().Be("Некорректный адрес электронной почты.");
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
