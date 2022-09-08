using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Repositories.Interfaces;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CourseWorkService.API.Repositories.Implementations
{
	public class DeadlineRepository : CrudRepository<Deadline, long>, IDeadlineRepository
	{
		public DeadlineRepository(CourseWorkContext context)
			: base(context)
		{
		}

		public async Task<Deadline> GetDeadlineAsync(long id)
		{
			return await Context.Set<Deadline>()
				.Include(d => d.CuratorProfile)
				.Include(d => d.DeadlineType)
				.Include(d => d.Direction)
				.AsNoTracking()
				.FirstOrDefaultAsync(d => d.Id == id);
		}

		public async Task<Deadline[]> FindAllDeadlines(Expression<Func<Deadline, bool>> predicate)
		{
			return await Context.Set<Deadline>()
				.Include(d => d.CuratorProfile)
				.Include(d => d.DeadlineType)
				.Include(d => d.Direction)
				.AsNoTracking()
				.Where(predicate)
				.ToArrayAsync()
				.ConfigureAwait(false);
		}
	}
}
