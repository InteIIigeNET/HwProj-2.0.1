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
            var name = GenerateString();
            var surname = GenerateString();
            var middleName = GenerateString();
            var email = GenerateEmail();
            var password = GenerateString();

            mainMenu
                .MoveToRegister()
                .Register(name, surname, email, password, password, middleName);

            WaitUntil.WaitLocation(_webDriver, _url, 5);

            var currentUrl = _webDriver.Url;
            currentUrl.Should().Be(_url);
        }

        [Test]
        public void UserRegistrationTwiceTest()
        {
            var mainMenu = new MainMenuPageObject(_webDriver);
            var name = GenerateString();
            var surname = GenerateString();
            var middleName = GenerateString();
            var email = GenerateEmail();
            var password = GenerateString();

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
            var name = GenerateString();
            var surname = GenerateString();
            var middleName = GenerateString();
            var email = GenerateEmail();
            var password = GenerateString();
            var confirmPassword = GenerateString();

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
            var name = GenerateString();
            var surname = GenerateString();
            var middleName = GenerateString();
            var email = GenerateEmail();
            var password = GenerateString();

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
            var email = GenerateEmail();
            var password = GenerateString();

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
            var name = GenerateString();
            var surname = GenerateString();
            var middleName = GenerateString();
            var email = GenerateEmail();
            var password = GenerateString();
            var incorrectPassword = GenerateString();

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
            var name = GenerateString();
            var surname = GenerateString();
            var middleName = GenerateString();
            var email = GenerateEmail();
            var password = GenerateString();

            var newName = GenerateString();
            var newSurname = GenerateString();
            var newMiddleName = GenerateString();

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
            var name = GenerateString();
            var surname = GenerateString();
            var middleName = GenerateString();
            var email = GenerateEmail();
            var password = GenerateString();

            var newPassword = GenerateString();

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
            var name = GenerateString();
            var surname = GenerateString();
            var middleName = GenerateString();
            var email = GenerateEmail();
            var password = GenerateString();

            var newName = GenerateString();
            var newSurname = GenerateString();
            var newMiddleName = GenerateString();
            var newPassword = GenerateString();

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
            var name = GenerateString();
            var surname = GenerateString();
            var middleName = GenerateString();
            var email = GenerateEmail();
            var password = GenerateString();

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
            var name = GenerateString();
            var surname = GenerateString();
            var middleName = GenerateString();
            var email = GenerateEmail();
            var password = GenerateString();

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

        private string GenerateString()
            => new Fixture().Create<string>().Substring(0, 6);

        private string GenerateEmail()
            => new Fixture().Create<MailAddress>().Address;
    }
}
