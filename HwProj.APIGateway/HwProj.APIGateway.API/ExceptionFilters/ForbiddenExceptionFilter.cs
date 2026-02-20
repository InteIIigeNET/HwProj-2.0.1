using System;
using HwProj.Exceptions;
using Microsoft.AspNetCore.Mvc.Filters;

namespace HwProj.APIGateway.API.ExceptionFilters;

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
