using System;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace HwProj.CourseWorkService.API.Filters
{
    public class OnlyStudentAttribute : Attribute, IAuthorizationFilter
    {
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            if (context.HttpContext.Request.GetUserRole() != "Student")
            {
                context.Result = new ForbidResult();
            }
        }
    }
}
