using System;
using System.Linq;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Repositories;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace HwProj.CourseWorkService.API.Filters
{
    public class OnlySelectRoleAttribute : Attribute, IAsyncAuthorizationFilter
    {
        private readonly RoleNames _role;
        private readonly IUsersRepository _usersRepository;

        public OnlySelectRoleAttribute(RoleNames role, IUsersRepository usersRepository)
        {
            _role = role;
            _usersRepository = usersRepository;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var userId = context.HttpContext.Request.GetUserId();
            var userRoles = await _usersRepository.GetRoles(userId).ConfigureAwait(false);
            if (!userRoles.Contains(_role))
            {
                context.Result = new ForbidResult();
            }
        }
    }
}
