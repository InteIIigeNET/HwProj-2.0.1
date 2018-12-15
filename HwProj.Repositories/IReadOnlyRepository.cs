using Microsoft.EntityFrameworkCore.Metadata;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Models.Repositories
{
    public interface IReadOnlyRepository<T>
        where T : class, new()
    {
        IReadOnlyCollection<T> GetAll();
        Task<T> GetAsync(Expression<Func<T, bool>> predicate);
        Task<bool> ContainsAsync(Expression<Func<T, bool>> predicate);
    }
}
