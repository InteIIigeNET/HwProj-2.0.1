using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace HwProj.HttpUtils
{
    public static class JsonConvertExtensions
    {
        public static async Task<T> DeserializeAsync<T>(this HttpResponseMessage response)
        {
            var content = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
            return JsonConvert.DeserializeObject<T>(content, HwProjJsonSerializerSettings.Settings);
        }
    }
}