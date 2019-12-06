using System;
using RabbitMQ.Client;

namespace HwProj.EventBus.Client.Interfaces
{
    public interface IDefaultConnection : IDisposable
    {     
        bool IsConnected { get; }

        IModel CreateModel();

        bool TryConnect();
    }
}