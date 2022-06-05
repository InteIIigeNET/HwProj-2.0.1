using System;
using System.Linq;
using System.Net.Http;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using NUnit.Framework;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.TelegramBotService;
using HwProj.TelegramBotService.API.Models;
using HwProj.TelegramBotService.API.Repositories;
using HwProj.TelegramBotService.API.Service;
using HwProj.TelegramBotService.Client;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.DependencyInjection;
using AutoFixture;
using FluentAssertions;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.Client;
using Moq;
using Newtonsoft.Json;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;
using Startup = HwProj.TelegramBotService.API.Startup;

namespace HwProj.TelegramBotService.Test
{
    public class Tests
    {
        private readonly UserTelegramTelegramService _userTelegramTelegramService;
        private readonly AuthServiceClient _authService;

        public Tests()
        {
            var eventBus = new Mock<IEventBus>();
            _authService = CreateAuthServiceClient();
            var mock = new Mock<IAuthServiceClient>();
            var repo = new Mock<ITelegramBotRepository>();
            _userTelegramTelegramService = new UserTelegramTelegramService(mock.Object, eventBus.Object, repo.Object);
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
        
        private NotificationsServiceClient CreateNotificationsServiceClient()
        {
            var mockIConfiguration = new Mock<IConfiguration>();
            mockIConfiguration
                .Setup(x => x.GetSection("Services")["Notifications"])
                .Returns("http://localhost:5006");

            var mockClientFactory = new Mock<IHttpClientFactory>();
            mockClientFactory
                .Setup(x => x.CreateClient(Options.DefaultName))
                .Returns(new HttpClient());

            return new NotificationsServiceClient(mockClientFactory.Object, mockIConfiguration.Object);
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
            await _userTelegramTelegramService.CreateUser(chatId);
            userTelegram = await _userTelegramTelegramService.AddEmailToUser(chatId, email);
            await _userTelegramTelegramService.AddFinishUser(chatId, userTelegram.Code);
            return userTelegram.ChatId;
        }

        public Update createUpdate(long chatId)
        {
            var fixture = new Fixture();
            fixture.Behaviors.OfType<ThrowingRecursionBehavior>().ToList().ForEach(b => fixture.Behaviors.Remove(b));
            fixture.Behaviors.Add(new OmitOnRecursionBehavior());
            var chat = fixture.Build<Chat>()
                .With(h => h.Id, chatId)
                .Create();
            var msg = fixture.Build<Message>()
                .With(h => h.Text, "/start")
                .With(h => h.Chat, chat)
                .Create();
            return fixture.Build<Update>()
                .With(h => h.Message, msg)
                .Create();
        }

        [Test]
        public async Task СheckUserTest()
        {
            var (studentId, email) = await CreateAndRegisterUser();
            var telegramBotServiceClient = CreateTelegramBotServiceClient();
            var notificationsClient = CreateNotificationsServiceClient();
            var webHost = new WebApplicationFactory<Startup>();
            var client = webHost.CreateClient();
            var chatId = new Fixture().Create<long>();
            var upd = createUpdate(chatId);
            
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post, 
                "http://localhost:5009/api/TelegramBot");
            httpRequest.Content = new StringContent(
                JsonConvert.SerializeObject(upd, Formatting.Indented, new JsonSerializerSettings
                {
                    NullValueHandling = NullValueHandling.Ignore
                }),
                Encoding.UTF8,
                "application/json");
            await client.SendAsync(httpRequest);
            
            upd.Message.Text = email;
            using var httpRequest1 = new HttpRequestMessage(
                HttpMethod.Post, 
                "http://localhost:5009/api/TelegramBot");
            httpRequest1.Content = new StringContent(
                JsonConvert.SerializeObject(upd, Formatting.Indented, new JsonSerializerSettings
                {
                    NullValueHandling = NullValueHandling.Ignore
                }),
                Encoding.UTF8,
                "application/json");
            await client.SendAsync(httpRequest1);
            
            var notifications = await notificationsClient.Get(studentId, new NotificationFilter());
            while (notifications.Length != 2)
            {
                notifications = await notificationsClient.Get(studentId, new NotificationFilter());
            }
            var text = notifications[1].Body.Split(' ')[5];
            upd.Message.Text = text;
            using var httpRequest2 = new HttpRequestMessage(
                HttpMethod.Post, 
                "http://localhost:5009/" + $"api/TelegramBot");
            httpRequest2.Content = new StringContent(
                JsonConvert.SerializeObject(upd, Formatting.Indented, new JsonSerializerSettings
                {
                    NullValueHandling = NullValueHandling.Ignore
                }),
                Encoding.UTF8,
                "application/json");
            await client.SendAsync(httpRequest2);
            
            var (check, _) = await telegramBotServiceClient.CheckUser(studentId);
            check.Should().BeTrue();
        }
        
    }    
}

