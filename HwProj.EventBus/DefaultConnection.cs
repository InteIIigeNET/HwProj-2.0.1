using Polly;
using Polly.Retry;
using RabbitMQ.Client;
using RabbitMQ.Client.Exceptions;
using System;
using System.Net.Sockets;

namespace HwProj.EventBus
{
    public class DefaultConnection : IDisposable
    {
        private readonly object _lock = new object();

        private readonly int _retryCount;

        private readonly IConnectionFactory _factory;
        private IConnection _connection;

        private bool _isDisposed;

        public bool IsConnected => _connection != null && _connection.IsOpen && !_isDisposed;

        public DefaultConnection(string hostName = "localhost", int retryCount = 5)
        {
            _factory = new ConnectionFactory() { HostName = hostName };
            _retryCount = retryCount;
        }

        public IModel CreateModel()
        {
            return IsConnected ? _connection.CreateModel() : throw new InvalidOperationException("No RabbitMQ connections are available to perform this action");
        }

        public bool TryConnect()
        {
            lock (_lock)
            {
                var policy = GetPolicy(_retryCount);

                policy.Execute(() => _connection = _factory.CreateConnection());

                if (IsConnected)
                {
                    _connection.CallbackException += OnErrorConnection;
                    _connection.ConnectionBlocked += OnErrorConnection;
                    _connection.ConnectionShutdown += OnErrorConnection;

                    return true;
                }
                else
                {
                    return false;
                }
            }                   
        }

        public RetryPolicy GetPolicy(int retryCount)
        {
            return Policy.Handle<SocketException>()
                       .Or<BrokerUnreachableException>()
                       .WaitAndRetry(retryCount, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));
        }

        public void Dispose()
        {
            _isDisposed = true;
            _connection?.Dispose();
        }

        private void OnErrorConnection(object sender, EventArgs ea)
        {
            if (!_isDisposed)
            {
                TryConnect();
            }
        }
    }
}
