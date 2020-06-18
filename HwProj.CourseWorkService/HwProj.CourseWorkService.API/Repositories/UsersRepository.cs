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
        private readonly IServiceScopeFactory _serviceScopeFactory;

        public UsersRepository(CourseWorkContext context, IServiceScopeFactory serviceScopeFactory)
           : base(context)
        {
            _serviceScopeFactory = serviceScopeFactory;
        }

        public async Task<User> GetUserAsync(string userId)
        {
            return await Context.Set<User>()
                .Include(u => u.StudentProfile)
                .FirstOrDefaultAsync(u => u.Id == userId);
        }

        public async Task<string[]> GetRoles(string id)
        {
            var user = await Context.Set<User>().Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role).FirstOrDefaultAsync(u => u.Id == id)
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

            await AddRoleAsync(user.Id, "Student");
        }

        public async Task AddRoleAsync(string userId, string role)
        {
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                using (var context = (CourseWorkContext) scope.ServiceProvider.GetService(typeof(CourseWorkContext)))
                {
                    var user = await context.Users.Include(u => u.UserRoles)
                        .FirstOrDefaultAsync(u => u.Id == userId);

                    var foundRole = await context.Roles.FirstOrDefaultAsync(r => r.RoleName == role);
                    user.UserRoles.Add(new UserRole() { UserId = user.Id, RoleId = foundRole.Id });

                    await context.SaveChangesAsync();
                }
            }

            await DoingRoleProfileAction(userId, role, Action.Add).ConfigureAwait(false);
        }

        public async Task RemoveRoleAsync(string userId, string role)
        {
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                using (var context = (CourseWorkContext)scope.ServiceProvider.GetService(typeof(CourseWorkContext)))
                {
                    var user = await context.Users.Include(u => u.UserRoles)
                        .ThenInclude(ur => ur.Role).FirstOrDefaultAsync(u => u.Id == userId);

                    var foundRole = user.UserRoles.FirstOrDefault(ur => ur.Role.RoleName == role);
                    user.UserRoles.Remove(foundRole);

                    await context.SaveChangesAsync();
                }
            }

            await DoingRoleProfileAction(userId, role, Action.Remove).ConfigureAwait(false);
        }

        private enum Action
        {
            Add,
            Remove
        }

        private async Task DoingRoleProfileAction(string userId, string role, Action action)
        {
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                using (var context = (CourseWorkContext)scope.ServiceProvider.GetService(typeof(CourseWorkContext)))
                {
                    var user = await context.Users
                        .Include(u => u.StudentProfile)
                        .FirstOrDefaultAsync(u => u.Id == userId);

                    switch (role)
                    {
                        case "Reviewer":
                        {
                            //ReviewerProfile
                            break;
                        }
                        case "Lecturer":
                        {
                            if (action == Action.Add)
                            {
                                user.LecturerProfile = new LecturerProfile() {Id = userId};
                            }
                            else
                            {
                                context.LecturerProfiles.Remove(user.LecturerProfile);
                            }
                            break;
                        }
                        case "Curator":
                        {
                            //CuratorProfile
                            break;
                        }
                        default:
                        {
                            if (action == Action.Add)
                            {
                                user.StudentProfile = new StudentProfile {Id = userId};
                            }
                            else
                            {
                                context.StudentProfiles.Remove(user.StudentProfile);
                            }
                            break;
                        }
                    }

                    await context.SaveChangesAsync();
                }
            }
        }
    }
}
