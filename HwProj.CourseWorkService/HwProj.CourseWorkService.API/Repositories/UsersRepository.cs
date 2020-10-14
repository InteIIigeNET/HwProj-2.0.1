using System;
using System.Linq;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace HwProj.CourseWorkService.API.Repositories
{
    public class UsersRepository : CrudRepository<User, string>, IUsersRepository
    {
        #region Enums: Private

        private enum Action
        {
            None,
            Add,
            Remove
        }

        #endregion

        #region Fields: Private

        private readonly IServiceScopeFactory _serviceScopeFactory;

        #endregion

        #region Constructors: Public

        public UsersRepository(CourseWorkContext context, IServiceScopeFactory serviceScopeFactory)
            : base(context)
        {
            _serviceScopeFactory = serviceScopeFactory;
        }

        #endregion

        #region Methods: Private

        private async Task DoingRoleProfileAction(string userId, RoleNames role, Action action)
        {
            using (var scope = _serviceScopeFactory.CreateScope())
            using (var context = (CourseWorkContext)scope.ServiceProvider.GetService(typeof(CourseWorkContext)))
            {
                var user = await context.Users
                    .Include(u => u.StudentProfile)
                    .Include(u => u.LecturerProfile)
                    .Include(u => u.ReviewerProfile)
                    .Include(u => u.CuratorProfile)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (action == Action.Add)
                {
                    switch (role)
                    {
                        case RoleNames.Student:
                            {
                                user.StudentProfile = new StudentProfile { Id = userId };
                                break;
                            }
                        case RoleNames.Lecturer:
                            {
                                user.LecturerProfile = new LecturerProfile() { Id = userId };
                                break;
                            }
                        case RoleNames.Reviewer:
                            {
                                user.ReviewerProfile = new ReviewerProfile() { Id = userId };
                                break;
                            }
                        case RoleNames.Curator:
                            {
                                user.CuratorProfile = new CuratorProfile() { Id = userId };
                                break;
                            }
                    }
                }
                else if (action == Action.Remove)
                {
                    switch (role)
                    {
                        case RoleNames.Student:
                            {
                                context.StudentProfiles.Remove(user.StudentProfile);
                                break;
                            }
                        case RoleNames.Lecturer:
                            {
                                context.LecturerProfiles.Remove(user.LecturerProfile);
                                break;
                            }
                        case RoleNames.Reviewer:
                            {
                                context.ReviewerProfiles.Remove(user.ReviewerProfile);
                                break;
                            }
                        case RoleNames.Curator:
                            {
                                context.CuratorProfiles.Remove(user.CuratorProfile);
                                break;
                            }
                    }
                }

                await context.SaveChangesAsync();
            }
        }

        #endregion

        #region Methods: Public

        public async Task<User> GetUserAsync(string userId)
        {
            return await Context.Set<User>()
                .Include(u => u.StudentProfile)
                .FirstOrDefaultAsync(u => u.Id == userId);
        }

        public async Task<RoleNames[]> GetRoles(string userId)
        {
            var user = await Context.Set<User>().Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role).FirstOrDefaultAsync(u => u.Id == userId)
                .ConfigureAwait(false);
            return user.UserRoles.Select(ur => ur.Role.RoleName).ToArray();
        }

        public async Task AddNewUserAsync(User user)
        {
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                using (var context = (CourseWorkContext)scope.ServiceProvider.GetService(typeof(CourseWorkContext)))
                {
                    await context.Users.AddAsync(user);
                    await context.SaveChangesAsync();
                }
            }

            await AddRoleAsync(user.Id, RoleNames.Student);
        }

        public async Task AddRoleAsync(string userId, RoleNames role)
        {
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                using (var context = (CourseWorkContext) scope.ServiceProvider.GetService(typeof(CourseWorkContext)))
                {
                    var user = await context.Users.Include(u => u.UserRoles)
                        .FirstOrDefaultAsync(u => u.Id == userId);

                    var foundRole = await context.Roles.FirstOrDefaultAsync(r => r.RoleName == role)
                                    ?? throw new ArgumentException(nameof(role));
                    user.UserRoles.Add(new UserRole() { UserId = user.Id, RoleId = foundRole.Id });

                    await context.SaveChangesAsync();
                }
            }

            await DoingRoleProfileAction(userId, role, Action.Add).ConfigureAwait(false);
        }

        public async Task RemoveRoleAsync(string userId, RoleNames role)
        {
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                using (var context = (CourseWorkContext)scope.ServiceProvider.GetService(typeof(CourseWorkContext)))
                {
                    var user = await context.Users.Include(u => u.UserRoles)
                        .ThenInclude(ur => ur.Role).FirstOrDefaultAsync(u => u.Id == userId);

                    var foundRole = user.UserRoles.FirstOrDefault(ur => ur.Role.RoleName == role) 
                                    ?? throw new ArgumentException(nameof(role));
                    user.UserRoles.Remove(foundRole);

                    await context.SaveChangesAsync();
                }
            }

            await DoingRoleProfileAction(userId, role, Action.Remove).ConfigureAwait(false);
        }

        #endregion
    }
}
