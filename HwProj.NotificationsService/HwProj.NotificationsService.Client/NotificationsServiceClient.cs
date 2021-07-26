using HwProj.HttpUtils;
using HwProj.Models.NotificationsService;
using Newtonsoft.Json;
using System;
using System.Net.Http;
using System.Text;
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

        public async Task<NotificationViewModel[]> Get(string userId, NotificationFilter filter)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _notificationServiceUri + $"api/notifications/get/{userId}");
            
            var jsonFilter = JsonConvert.SerializeObject(filter);
            httpRequest.Content = new StringContent(jsonFilter, Encoding.UTF8, "application/json");
            
            var response = await _httpClient.SendAsync(httpRequest);
            var data = await response.DeserializeAsync<NotificationViewModel[]>();
            return data ?? new NotificationViewModel[] { };
        }
    }
}
