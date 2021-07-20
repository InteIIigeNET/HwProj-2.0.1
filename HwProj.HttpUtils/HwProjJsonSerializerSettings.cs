using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;

namespace HwProj.HttpUtils
{
    public class HwProjJsonSerializerSettings
    {
        static HwProjJsonSerializerSettings()
        {
            Settings = new JsonSerializerSettings()
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver(),
                NullValueHandling = NullValueHandling.Ignore,
                Converters = new JsonConverter[]
                {
                    new StringEnumConverter(new CamelCaseNamingStrategy()),
                }
            };
        }

        public static JsonSerializerSettings Settings { get; }
    }
}