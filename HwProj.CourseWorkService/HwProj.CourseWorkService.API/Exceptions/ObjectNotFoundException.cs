using System;

namespace HwProj.CourseWorkService.API.Exceptions
{
    public class ObjectNotFoundException : Exception
    {
        public ObjectNotFoundException(string objectName) : base(objectName + "not found")
        {
        }
    }
}
