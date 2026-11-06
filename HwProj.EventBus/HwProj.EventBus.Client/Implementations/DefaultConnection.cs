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
        private IConnection? _connection;

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
            return IsConnected ? _connection!.CreateModel() : throw new InvalidOperationException("No RabbitMQ connections are available to perform this action");
        }

        public bool TryConnect()
        {
            lock (_lock)
            {
                if (_isDisposed) return false;

                // Разрывы соединения после успешного подключения обрабатывает автоматическое восстановление
                // RabbitMQ.Client (AutomaticRecoveryEnabled), которое также восстанавливает каналы и консьюмеры.
                // Повторное создание соединения вручную привело бы к утечке старого соединения и потере консьюмера.
                if (_connection == null)
                    _policy.Execute(() => _connection = _factory.CreateConnection());

                return IsConnected;
            }
        }

        public void Dispose()
        {
            lock (_lock)
            {
                if (_isDisposed) return;
                _isDisposed = true;
                _connection?.Dispose();
            }
        }
    }
}
