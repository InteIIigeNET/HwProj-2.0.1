using System;
using System.Collections.Generic;
using System.Linq;
using HwProj.CourseWorkService.API.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace HwProj.CourseWorkService.API.Filters
{
    public class CommonExceptionFilterAttribute : Attribute, IExceptionFilter
    {
        private readonly IEnumerable<Type> _exceptionTypes;

        public CommonExceptionFilterAttribute(IEnumerable<Type> exceptionTypes)
        {
            _exceptionTypes = exceptionTypes;
        }

        public void OnException(ExceptionContext context)
        {
            if (_exceptionTypes.All(exType => exType != context.Exception.GetType())) return;

            switch (context.Exception)
            {
                case ForbidException _:
                {
                    context.Result = new ForbidResult();
                    break;
                }
                case ObjectNotFoundException _:
                {
                    context.Result = new NotFoundResult();
                    break;
                }
                case BadRequestException _:
                {
                    context.Result = new BadRequestResult();
                    break;
                }
            }

            context.ExceptionHandled = true;
        }
    }
}
