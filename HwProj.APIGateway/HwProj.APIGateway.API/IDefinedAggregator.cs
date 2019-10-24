using System.Threading.Tasks;
using Ocelot.Middleware;
using System.Collections.Generic;
using Ocelot.Middleware.Multiplexer;
using System.Linq;
using Newtonsoft.Json.Linq;
using System.Net.Http;

namespace HwProj.APIGateway.API
{
    public class ProfileAggregator : IDefinedAggregator
    {
        public async Task<DownstreamResponse> Aggregate(List<DownstreamContext> responses)
        {

            var getDataTasks = responses.Select(t => t.DownstreamResponse.Content.ReadAsStringAsync());
            var data = await Task.WhenAll(getDataTasks);

            var aggregatedProfileData = data.Select(t => JObject.Parse(t))
                               .Aggregate((result, t) =>
                               {
                                   result.Merge(t);
                                   return result;
                               });
            return new DownstreamResponse(new HttpResponseMessage
            {
                Content = new StringContent(aggregatedProfileData.ToString())
            });
        }
    }
}
