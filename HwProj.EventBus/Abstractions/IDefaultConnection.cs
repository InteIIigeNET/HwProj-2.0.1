using RabbitMQ.Client;
using System;

namespace HwProj.EventBus
{
    public interface IDefaultConnection : IDisposable
    {     
        bool IsConnected { get; }

        IModel CreateModel();

        bool TryConnect();
    }
}
