using System;

namespace HwProj.Repositories
{
    public interface IEntity<T>
        where T : IEquatable<T>
    {
        T Id { get; set; }
    }
}
