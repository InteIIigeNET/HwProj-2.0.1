using System;

namespace HwProj.Repositories.Net8;

public interface IEntity<TKey>
    where TKey : IEquatable<TKey>
{
    TKey Id { get; set; }
}
