using System;
using System.Linq;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.UserInfo;
using HwProj.CourseWorkService.API.Repositories.Interfaces;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;
using Z.EntityFramework.Plus;

namespace HwProj.CourseWorkService.API.Repositories.Implementations
{
    public class UsersRepository : CrudRepository<User, string>, IUsersRepository
    {
        #region Constructors: Public

        public UsersRepository(CourseWorkContext context) : base(context)
        {
        }

        #endregion

        #region Methods: Public

        public async Task<User> GetUserAsync(string userId)
        {
            return await Context.Set<User>()
                .Include(u => u.StudentProfile)
                .Include(u => u.LecturerProfile)
                .Include(u => u.ReviewerProfile)
                .Include(u => u.CuratorProfile)
					.ThenInclude(cp => cp.Directions)
                .Include(u => u.CuratorProfile)
					.ThenInclude(cp => cp.Deadlines)
                .Include(u => u.ReviewerProfile)
					.ThenInclude(rp => rp.ReviewersInCuratorsBidding)
                .Include(u => u.ReviewerProfile)
					.ThenInclude(rp => rp.CourseWorks)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId)
                .ConfigureAwait(false);
        }

        public async Task<Roles[]> GetRolesTypesAsync(string userId)
        {
            var roles = await GetRolesAsync(userId).ConfigureAwait(false);
            return roles.Select(role => (Roles)role.Id).ToArray();
        }

        public async Task<Role[]> GetRolesAsync(string userId)
        {
            var user = await Context.Set<User>().Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId)
                .ConfigureAwait(false);
            return user.UserRoles.Select(ur => ur.Role).ToArray();
        }

        public async Task<User[]> GetUsersByRoleAsync(Roles role)
        {
            return await Context.Set<User>()
	            .Include(u => u.UserRoles)
					.ThenInclude(ur => ur.Role)
                .Include(u => u.CuratorProfile)
					.ThenInclude(cp => cp.Directions)
	            .Include(u => u.ReviewerProfile)
					.ThenInclude(rp => rp.ReviewersInCuratorsBidding)
                .AsNoTracking()
                .Where(u => u.UserRoles.Select(ur => (Roles)ur.Role.Id).Contains(role))
                .ToArrayAsync()
                .ConfigureAwait(false);
        }

        public async Task AddRoleToUserAsync(string userId, Roles role)
        {
            var user = await Context.Set<User>()
                .Include(u => u.UserRoles)
                .Include(u => u.StudentProfile)
                .Include(u => u.LecturerProfile)
                .Include(u => u.ReviewerProfile)
                .Include(u => u.CuratorProfile)
                .FirstOrDefaultAsync(u => u.Id == userId);

            user.UserRoles.Add(new UserRole() { UserId = user.Id, RoleId = (long)role });

            switch (role)
            {
                case Roles.Student:
                {
                    user.StudentProfile = new StudentProfile { Id = userId };
                    break;
                }
                case Roles.Lecturer:
                {
                    user.LecturerProfile = new LecturerProfile() { Id = userId };
                    break;
                }
                case Roles.Reviewer:
                {
                    user.ReviewerProfile = new ReviewerProfile() { Id = userId };
                    break;
                }
                case Roles.Curator:
                {
                    user.CuratorProfile = new CuratorProfile() { Id = userId };
                    break;
                }
            }

            await Context.SaveChangesAsync();
        }

        public async Task RemoveRoleFromUserAsync(string userId, Roles role)
        {
            var user = await Context.Set<User>()
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .Include(u => u.StudentProfile)
                .Include(u => u.LecturerProfile)
                .Include(u => u.ReviewerProfile)
                .Include(u => u.CuratorProfile)
                .FirstOrDefaultAsync(u => u.Id == userId);

            var foundRole = user.UserRoles.FirstOrDefault(ur => ur.RoleId == (long)role)
                            ?? throw new ArgumentException(nameof(role));
            user.UserRoles.Remove(foundRole);

            switch (role)
            {
                case Roles.Student:
                {
                    Context.Set<StudentProfile>().Remove(user.StudentProfile);
                    break;
                }
                case Roles.Lecturer:
                {
                    Context.Set<LecturerProfile>().Remove(user.LecturerProfile);
                    break;
                }
                case Roles.Reviewer:
                {
                    Context.Set<ReviewerProfile>().Remove(user.ReviewerProfile);
                    break;
                }
                case Roles.Curator:
                {
                    Context.Set<CuratorProfile>().Remove(user.CuratorProfile);
                    break;
                }
            }

            await Context.SaveChangesAsync();
        }

        public async Task UpdateUserRoleProfileAsync<TProfile>(string userId, TProfile roleProfile) where TProfile : class, IProfile
        {

            if (roleProfile is StudentProfile studentProfile)
            {
                await Context.Set<StudentProfile>()
                    .Where(p => p.UserId == userId)
                    .UpdateAsync(sp => new StudentProfile()
                    {
                        Course = studentProfile.Course,
                        Group = studentProfile.Group,
                        DirectionId = studentProfile.DirectionId
                    }).ConfigureAwait(false);
            }

            if (roleProfile is LecturerProfile lecturerProfile)
            {
                await Context.Set<LecturerProfile>()
                    .Where(p => p.UserId == userId)
                    .UpdateAsync(sp => new LecturerProfile()
                    {
                        Contact = lecturerProfile.Contact,
                        DepartmentId = lecturerProfile.DepartmentId
                    }).ConfigureAwait(false);
            }

            if (roleProfile is CuratorProfile curatorProfile)
            {
                await Context.Set<CuratorProfile>()
                    .Where(p => p.UserId == userId)
                    .UpdateAsync(sp => new CuratorProfile()
                    {
                        DepartmentId = curatorProfile.DepartmentId
                    }).ConfigureAwait(false);
            }
        }

        public async Task SetReviewersToCuratorBidding(string curatorId, string[] reviewersId)
        {
	        var curator = await Context.Set<CuratorProfile>()
		        .Include(cp => cp.ReviewersInCuratorsBidding)
		        .FirstOrDefaultAsync(cp => cp.Id == curatorId)
		        .ConfigureAwait(false);

	        curator.ReviewersInCuratorsBidding.Clear();
            curator.ReviewersInCuratorsBidding.AddRange(reviewersId
	            .Select(reviewerId => new ReviewersInCuratorsBidding
	            {
                    CuratorProfileId = curatorId,
                    ReviewerProfileId = reviewerId
	            }));

            await Context.SaveChangesAsync().ConfigureAwait(false);
        }
        #endregion
    }
}
