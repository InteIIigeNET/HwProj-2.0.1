using System;
using RabbitMQ.Client;

namespace HwProj.EventBus.Abstractions
{
    public interface IDefaultConnection : IDisposable
    {     
        bool IsConnected { get; }

        IModel CreateModel();

        bool TryConnect();
    }
}