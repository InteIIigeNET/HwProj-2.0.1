using System;
using HwProj.CourseWorkService.API.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace HwProj.CourseWorkService.API.Filters
{
    public class NotFoundExceptionFilterAttribute : Attribute, IExceptionFilter
    {
        public void OnException(ExceptionContext context)
        {
            if (!(context.Exception is ObjectNotFoundException)) return;

            context.Result = new NotFoundResult();
            context.ExceptionHandled = true;
        }
    }
}
