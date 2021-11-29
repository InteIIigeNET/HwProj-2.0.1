using System;
using System.Net.Http;
using System.Threading.Tasks;
using HwProj.HttpUtils;
using HwProj.TelegramBotService.API.Models;
using Microsoft.Extensions.Configuration;

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
        
        public async Task<TelegramUserModel> GetTelegramUser(string studentId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get, 
                _telegramBotUri + $"api/TelegramBot/get/{studentId}");

            var response = await _httpClient.SendAsync(httpRequest); 
            return await response.DeserializeAsync<TelegramUserModel>();
        }
    }
}