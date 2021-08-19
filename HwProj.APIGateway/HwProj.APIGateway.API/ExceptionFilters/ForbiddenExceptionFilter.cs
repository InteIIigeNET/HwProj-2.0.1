using HwProj.Exceptions;
using Microsoft.AspNetCore.Mvc.Filters;
using System;

namespace HwProj.APIGateway.API.ExceptionFilters
{
    public class ForbiddenExceptionFilter : Attribute, IExceptionFilter
    {
        public void OnException(ExceptionContext context)
        {
            if (context.Exception is ForbiddenException)
            {
                context.ExceptionHandled = true;
                context.HttpContext.Response.StatusCode = 403;
            }
        }
    }

}