using System;
using System.Text;

namespace HwProj.Utils.HttpUtils
{
    public class RequestUrlBuilder
    {
        private readonly StringBuilder _uriBuilder = new StringBuilder();
        private bool _withQuery;

        public RequestUrlBuilder(Uri baseUri)
        {
            _uriBuilder.Append(baseUri.AbsolutePath);
        }

        public RequestUrlBuilder AppendToPath(string value)
        {
            _uriBuilder.Append($"/{value}");
            return this;
        }

        public RequestUrlBuilder AppendToPath<T>(T value)
        {
            _uriBuilder.Append($"/{value}");
            return this;
        }

        public RequestUrlBuilder AppendToQuery(string argName, string value)
        {
            if (_withQuery)
            {
                _uriBuilder.Append($"&{argName}={value}");
            }
            else
            {
                _uriBuilder.Append($"?{argName}={value}");
                _withQuery = true;
            }
            return this;
        }

        public string Build()
        {
            return _uriBuilder.ToString();
        }
    }
}