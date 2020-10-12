using System;
using HwProj.CourseWorkService.API.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace HwProj.CourseWorkService.API.Filters
{
    public class ForbidExceptionFilterAttribute : Attribute, IExceptionFilter
    {
        public void OnException(ExceptionContext context)
        {
            if (!(context.Exception is ForbidException)) return;

            context.Result = new ForbidResult();
            context.ExceptionHandled = true;
        }
    }
}
