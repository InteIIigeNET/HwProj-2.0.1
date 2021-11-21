using System;
using System.Net.Http;

namespace HwProj.TelegramBot.Client
{
    public class TelegramBotClient : ITelegramBotClient
    {
        private readonly HttpClient _httpClient;
        private readonly Uri _telegramBotUri;

        public TelegramBotClient(HttpClient httpClient, Uri telegramBotUri)
        {
            _httpClient = httpClient;
            _telegramBotUri = telegramBotUri;
        }
    }
}