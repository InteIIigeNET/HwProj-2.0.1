using System;
using System.Linq;
using HwProj.Models.Roles;
using Microsoft.AspNetCore.Http;

namespace HwProj.Utils.Authorization
{
    public static class AuthExtensions
    {
        public static string GetUserId(this HttpRequest request)
        {
            return request.HttpContext.User.FindFirst("_id").Value;
        }

        public static string GetUserName(this HttpRequest request)
        {
            return request.Query.First(x => x.Key == "_userName").Value.ToString();
        }

        public static string GetUserRole(this HttpRequest request)
        {
            return request.Query.First(x => x.Key == "_role").Value.ToString();
        }

        public static bool IsLecturer(this string role)
        {
            return role == Roles.LecturerRole;
        }
    }
}