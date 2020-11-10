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
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId)
                .ConfigureAwait(false);
        }

        public async Task<RoleTypes[]> GetRolesAsync(string userId)
        {
            var user = await Context.Set<User>().Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId)
                .ConfigureAwait(false);
            return user.UserRoles.Select(ur => ur.Role.RoleType).ToArray();
        }

        public async Task<User[]> GetUsersByRoleAsync(RoleTypes role)
        {
            return await Context.Set<User>().Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .AsNoTracking()
                .Where(u => u.UserRoles.Select(ur => ur.Role.RoleType).Contains(role))
                .ToArrayAsync()
                .ConfigureAwait(false);
        }

        public async Task AddRoleToUserAsync(string userId, RoleTypes role)
        {
            var user = await Context.Set<User>()
                .Include(u => u.UserRoles)
                .Include(u => u.StudentProfile)
                .Include(u => u.LecturerProfile)
                .Include(u => u.ReviewerProfile)
                .Include(u => u.CuratorProfile)
                .FirstOrDefaultAsync(u => u.Id == userId);

            var foundRole = await Context.Set<Role>().AsNoTracking().FirstOrDefaultAsync(r => r.RoleType == role)
                            ?? throw new ArgumentException(nameof(role));
            user.UserRoles.Add(new UserRole() { UserId = user.Id, RoleId = foundRole.Id });

            switch (role)
            {
                case RoleTypes.Student:
                {
                    user.StudentProfile = new StudentProfile { Id = userId };
                    break;
                }
                case RoleTypes.Lecturer:
                {
                    user.LecturerProfile = new LecturerProfile() { Id = userId };
                    break;
                }
                case RoleTypes.Reviewer:
                {
                    user.ReviewerProfile = new ReviewerProfile() { Id = userId };
                    break;
                }
                case RoleTypes.Curator:
                {
                    user.CuratorProfile = new CuratorProfile() { Id = userId };
                    break;
                }
            }

            await Context.SaveChangesAsync();
        }

        public async Task RemoveRoleFromUserAsync(string userId, RoleTypes role)
        {
            var user = await Context.Set<User>()
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .Include(u => u.StudentProfile)
                .Include(u => u.LecturerProfile)
                .Include(u => u.ReviewerProfile)
                .Include(u => u.CuratorProfile)
                .FirstOrDefaultAsync(u => u.Id == userId);

            var foundRole = user.UserRoles.FirstOrDefault(ur => ur.Role.RoleType == role)
                            ?? throw new ArgumentException(nameof(role));
            user.UserRoles.Remove(foundRole);

            switch (role)
            {
                case RoleTypes.Student:
                {
                    Context.Set<StudentProfile>().Remove(user.StudentProfile);
                    break;
                }
                case RoleTypes.Lecturer:
                {
                    Context.Set<LecturerProfile>().Remove(user.LecturerProfile);
                    break;
                }
                case RoleTypes.Reviewer:
                {
                    Context.Set<ReviewerProfile>().Remove(user.ReviewerProfile);
                    break;
                }
                case RoleTypes.Curator:
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
        #endregion
    }
}
