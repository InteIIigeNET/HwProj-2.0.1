using System.Linq;
using System.Net.Http;
using System.Net.Mail;
using System.Threading.Tasks;
using AutoFixture;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.TelegramBotService;
using HwProj.TelegramBotService.API.Models;
using NUnit.Framework;
using HwProj.TelegramBotService.API.Repositories;
using HwProj.TelegramBotService.API.Service;
using HwProj.TelegramBotService.Client;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Moq;
using Microsoft.Extensions.DependencyInjection;
using Telegram.Bot.Types;
using Startup = HwProj.TelegramBotService.API.Startup;

namespace HwProj.TelegramBotService.Test
{
    public class Tests
    {
        private readonly UserService _userService;
        private readonly AuthServiceClient _authService;

        public Tests()
        {
            var eventBus = new Mock<IEventBus>();
            _authService = CreateAuthServiceClient();
            var mock = new Mock<IAuthServiceClient>();
            var repo = new Mock<ITelegramBotRepository>();
            _userService = new UserService(mock.Object, eventBus.Object, repo.Object);
        }
        
        private TelegramBotServiceClient CreateTelegramBotServiceClient()
        {
            var mockIConfiguration = new Mock<IConfiguration>();
            mockIConfiguration
                .Setup(x => x.GetSection("Services")["TelegramBot"])
                .Returns("http://localhost:5009");

            var mockClientFactory = new Mock<IHttpClientFactory>();
            mockClientFactory
                .Setup(x => x.CreateClient(Options.DefaultName))
                .Returns(new HttpClient());

            return new TelegramBotServiceClient(mockClientFactory.Object, mockIConfiguration.Object);
        }

        private AuthServiceClient CreateAuthServiceClient()
        {
            var mockIConfiguration = new Mock<IConfiguration>();
            mockIConfiguration.Setup(x => x.GetSection("Services")["Auth"]).Returns("http://localhost:5001");
            var mockClientFactory = new Mock<IHttpClientFactory>();
            mockClientFactory.Setup(x => x.CreateClient(Options.DefaultName)).Returns(new HttpClient());
            return new AuthServiceClient(mockClientFactory.Object, mockIConfiguration.Object);
        }

        private static RegisterViewModel GenerateRegisterViewModel()
        {
            var password = new Fixture().Create<string>();

            var fixture = new Fixture().Build<RegisterViewModel>()
                .With(x => x.Email, new Fixture().Create<MailAddress>().Address)
                .With(x => x.Password, password)
                .With(x => x.PasswordConfirm, password);

            return fixture.Create();
        }

        private async Task<(string, string)> CreateAndRegisterUser()
        {
            var userData = GenerateRegisterViewModel();
            await _authService.Register(userData);
            var userId = await _authService.FindByEmailAsync(userData.Email);
            return (userId, userData.Email);
        }

        private async Task<long> RegisterTelegramUser(string userId, string email)
        {
            var chatId = new Fixture().Create<long>();
            var userTelegram = new UserTelegram 
            {
               ChatId = chatId,
               AccountId = null!,
               IsLecture = false,
               IsRegistered = false,
               Code = "AAAAA",
               Operation = "wait_code"
            };
            await _userService.CreateUser(chatId);
            userTelegram = await _userService.AddEmailToUser(chatId, email);
            await _userService.AddFinishUser(chatId, userTelegram.Code);
            return userTelegram.ChatId;
        }

        [Test]
        public async Task СheckUserTest()
        {
            var (studentId, email) = await CreateAndRegisterUser();
            var telegramBotServiceClient = CreateTelegramBotServiceClient();
            var checkUserBeforeRegisterInTelegram = await telegramBotServiceClient.CheckUser(studentId);
            await RegisterTelegramUser(studentId, email);
            var checkUserAfterRegisterInTelegram = await telegramBotServiceClient.CheckUser(studentId);
            Assert.IsTrue(!checkUserBeforeRegisterInTelegram);
            Assert.IsTrue(checkUserAfterRegisterInTelegram);
        }

        [Test]
        public async Task GetTelegramUserChatIdTest()
        {
            var (studentId, email) = await CreateAndRegisterUser();
            var telegramBotServiceClient = CreateTelegramBotServiceClient();
            var chatId = await RegisterTelegramUser(studentId, email);
            var chatIdFromGet = await telegramBotServiceClient.GetTelegramUserChatId(studentId);
            Assert.AreEqual(chatId, chatIdFromGet);
        }
    }    
}

