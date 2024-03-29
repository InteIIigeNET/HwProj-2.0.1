﻿using HwProj.HttpUtils;
using HwProj.Models.NotificationsService;
using Newtonsoft.Json;
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.Client
{
    public class NotificationsServiceClient : INotificationsServiceClient
    {
        private readonly HttpClient _httpClient;
        private readonly Uri _notificationServiceUri;

        public NotificationsServiceClient(IHttpClientFactory clientFactory, IConfiguration configuration)
        {
            _httpClient = clientFactory.CreateClient();
            _notificationServiceUri = new Uri(configuration.GetSection("Services")["Notifications"]);
        }

        public async Task<CategorizedNotifications[]> Get(string userId)
        {
            using var response =
                await _httpClient.GetAsync(_notificationServiceUri + $"api/notifications/get/{userId}");
            return await response.DeserializeAsync<CategorizedNotifications[]>() ?? new CategorizedNotifications[] { };
        }

        public async Task MarkAsSeen(string userId, long[] notificationIds)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Put,
                _notificationServiceUri + "api/notifications/markAsSeen/" + userId);

            var jsonIds = JsonConvert.SerializeObject(notificationIds);
            httpRequest.Content = new StringContent(jsonIds, Encoding.UTF8, "application/json");

            await _httpClient.SendAsync(httpRequest);
        }

        public async Task<int> GetNewNotificationsCount(string userId)
        {
            using var response =
                await _httpClient.GetAsync(_notificationServiceUri + $"api/notifications/new/{userId}");
            return await response.DeserializeAsync<int>();
        }

        public async Task<NotificationsSettingDto[]> GetSettings(string userId)
        {
            using var response =
                await _httpClient.GetAsync(_notificationServiceUri + $"api/notificationSettings/{userId}");
            return await response.DeserializeAsync<NotificationsSettingDto[]>();
        }

        public async Task ChangeSetting(string userId, NotificationsSettingDto newSetting)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Put,
                _notificationServiceUri + $"api/notificationSettings/{userId}")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(newSetting),
                    Encoding.UTF8,
                    "application/json")
            };

            await _httpClient.SendAsync(httpRequest);
        }

        public async Task<bool> Ping()
        {
            try
            {
                await _httpClient.GetAsync(_notificationServiceUri + "api/system/ping");
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
