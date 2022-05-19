using Newtonsoft.Json;

namespace HwProj.Models.Result
{
    public sealed class Result<T> 
    {
        public T Value { get; }
        public bool Succeeded { get; }
        public string[] Errors { get; }

        [JsonConstructor]
        private Result(T value, bool succeeded, string[] errors)
        {
            Succeeded = succeeded;
            Value = value;
            Errors = errors;
        }

        public static Result<T> Success(T value)
        {
            return new Result<T>(value, true, null);
        }

        public static Result<T> Failed(params string[] errors)
        {
            return new Result<T>(default, false, errors);
        }
    }
    
    public sealed class Result
    {
        public bool Succeeded { get; }
        public string[] Errors { get; }

        [JsonConstructor]
        private Result(bool succeeded, string[] errors)
        {
            Succeeded = succeeded;
            Errors = errors;
        }

        public static Result Success()
        {
            return new Result(true, null);
        }

        public static Result Failed(params string[] errors)
        {
            return new Result(false, errors);
        }
    }
}
