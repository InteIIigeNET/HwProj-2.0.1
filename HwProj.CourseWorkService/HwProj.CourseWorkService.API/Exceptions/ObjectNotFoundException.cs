using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CourseWorkService.API.Exceptions
{
    public class ObjectNotFoundException : Exception
    {
        public ObjectNotFoundException(string objectName) : base(objectName + "not found")
        {
        }
    }
}
