using System;
using System.Net.Http;
using System.Threading.Tasks;
using HwProj.HttpUtils;
using HwProj.TelegramBotService.API.Models;

namespace HwProj.TelegramBotService.Client
{
    public class TelegramBotServiceClient : ITelegramBotServiceClient
    {
        private readonly HttpClient _httpClient;
        private readonly Uri _telegramBotUri;

        public TelegramBotServiceClient(HttpClient httpClient, Uri telegramBotUri)
        {
            _httpClient = httpClient;
            _telegramBotUri = telegramBotUri;
        }

        public async Task<TelegramUserModel> GetTelegramUser(string studentId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get, 
                _telegramBotUri + $"api/Telegram/get/{studentId}");

            var response = await _httpClient.SendAsync(httpRequest); 
            return await response.DeserializeAsync<TelegramUserModel>();
        }
    }
}