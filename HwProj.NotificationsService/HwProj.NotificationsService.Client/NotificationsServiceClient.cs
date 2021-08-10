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
            return await response.DeserializeAsync<NotificationViewModel[]>() ?? new NotificationViewModel[] { };
        }

        public async Task MarkAsSeen(string userId, long[] notificationIds)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Put,
                _notificationServiceUri + $"api/notifications/markAsSeen/" + userId);

            var jsonIds = JsonConvert.SerializeObject(notificationIds);
            httpRequest.Content = new StringContent(jsonIds, Encoding.UTF8, "application/json");

            await _httpClient.SendAsync(httpRequest);
        }
    }
}
