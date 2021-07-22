using HwProj.HttpUtils;
using HwProj.Models.NotificationsService;
using System;
using System.Net.Http;
using System.Threading.Tasks;

namespace HwProj.NotificationsService.Client
{
    public class NotificationsServiceClient: INotificationsServiceClient
    {
        private readonly HttpClient _httpClient;

        private readonly Uri _notificationServiceUri;

        public NotificationsServiceClient(HttpClient httpClient, Uri notificationServiceUri)
        {
            _httpClient = httpClient;
            _notificationServiceUri = notificationServiceUri;
        }

        public async Task<Notification[]> Get(string userId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _notificationServiceUri + $"api/notifications/get/{userId}");

            var response = await _httpClient.SendAsync(httpRequest);
            var data = await response.DeserializeAsync<Notification[]>();
            return data;
        }
    }
}
