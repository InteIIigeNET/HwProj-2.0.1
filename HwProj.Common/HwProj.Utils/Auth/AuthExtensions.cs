﻿using System.Linq;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.Roles;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;

namespace HwProj.Utils.Authorization
{
    public static class AuthExtensions
    {
        public static string? GetUserIdFromHeader(this HttpRequest request) =>
            request.Headers.TryGetValue("UserId", out var id) ? id.FirstOrDefault() : null;

        public static AccountDataDto ToAccountDataDto(this User user, string role)
        {
            return new AccountDataDto(
                user.Id,
                user.Name,
                user.Surname,
                user.Email,
                role,
                user.IsExternalAuth,
                user.MiddleName,
                user.GitHubId,
                user.CompanyName,
                user.Bio);
        }

        public static string GetUserName(this HttpRequest request)
        {
            return request.Query.First(x => x.Key == "_userName").Value.ToString();
        }

        public static string GetUserRole(this HttpRequest request)
        {
            var claimRole = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
            var role = request.HttpContext.User.Claims.FirstOrDefault(claim => claim.Type.ToString() == claimRole);
            return role == null
                ? null
                : role.Value;
        }

        public static bool IsLecturer(this string role)
        {
            return role == Roles.LecturerRole;
        }

        public static string GetMentorId(this HttpRequest request)
        {
            request.HttpContext.Request.Headers.TryGetValue("UserId", out var userId);
            return StringValues.IsNullOrEmpty(userId)
                ? null
                : userId.ToString();
        }
    }
}
