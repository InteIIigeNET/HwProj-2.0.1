using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using HwProj.HttpUtils;
using HwProj.Models.TelegramBotService;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Telegram.Bot.Types;

namespace HwProj.TelegramBotService.Client
{
    public class TelegramBotServiceClient : ITelegramBotServiceClient
    {
        private readonly HttpClient _httpClient;
        private readonly Uri _telegramBotUri;

        public TelegramBotServiceClient(IHttpClientFactory clientFactory, IConfiguration configuration)
        {
            _httpClient = clientFactory.CreateClient();
            _telegramBotUri = new Uri(configuration.GetSection("Services")["TelegramBot"]);
        }

        public async Task<(bool, long)> CheckUser(string studentId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get, 
                _telegramBotUri + $"api/TelegramBot/check/{studentId}")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(studentId),
                    Encoding.UTF8,
                    "application/json")
            };

            var response = await _httpClient.SendAsync(httpRequest); 
            return await response.DeserializeAsync<(bool, long)>();
        }
    }
}