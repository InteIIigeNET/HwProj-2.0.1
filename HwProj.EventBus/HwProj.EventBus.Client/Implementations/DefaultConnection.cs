using System;
using HwProj.EventBus.Client.Interfaces;
using Polly.Retry;
using RabbitMQ.Client;

namespace HwProj.EventBus.Client.Implementations
{
    public class DefaultConnection : IDefaultConnection
    {
        private readonly object _lock = new object();

        private readonly RetryPolicy _policy;

        private readonly IConnectionFactory _factory;
        private IConnection _connection;

        private bool _isDisposed;

        public bool IsConnected => _connection != null && _connection.IsOpen && !_isDisposed;

        public DefaultConnection(RetryPolicy policy, IConnectionFactory factory)
        {
            _factory = factory;
            _policy = policy;
            TryConnect();
        }

        public IModel CreateModel()
        {
            return IsConnected ? _connection.CreateModel() : throw new InvalidOperationException("No RabbitMQ connections are available to perform this action");
        }

        public bool TryConnect()
        {
            lock (_lock)
            {
                _policy.Execute(() => _connection = _factory.CreateConnection());

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

        public void Dispose()
        {
            if (!_isDisposed)
            {
                _connection?.Close();
                _isDisposed = true;
            }
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
