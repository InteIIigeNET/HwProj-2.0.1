﻿using System;
using System.Linq;
using HwProj.Models.AuthService.DTO;

namespace HwProj.Models.SolutionsService
{
    public class GetSolutionModel
    {
        public GetSolutionModel(Solution model, AccountDataDto[]? groupMates, AccountDataDto? lecturer)
        {
            Id = model.Id;
            GithubUrl = model.GithubUrl;
            Comment = model.Comment;
            StudentId = model.StudentId;
            GroupMates = groupMates?
                             .OrderBy(t => t.Surname)
                             .ThenBy(t => t.Name)
                             .ToArray()
                         ?? Array.Empty<AccountDataDto>();
            LecturerComment = model.LecturerComment;
            PublicationDate = model.PublicationDate;
            Rating = model.Rating;
            StudentId = model.StudentId;
            TaskId = model.TaskId;
            State = model.State;
            Lecturer = lecturer;
            IsAutomatic = model.IsAutomatic;
            IsUpdated = model.IsUpdated;
        }

        public long Id { get; set; }

        public string GithubUrl { get; set; }

        public string Comment { get; set; }

        public SolutionState State { get; set; }

        public int Rating { get; set; }

        public string StudentId { get; set; }

        public long TaskId { get; set; }

        public DateTime PublicationDate { get; set; }

        public string LecturerComment { get; set; }

        public AccountDataDto[] GroupMates { get; set; }

        public AccountDataDto? Lecturer { get; set; }

        public bool IsAutomatic { get; set; }

        public bool IsUpdated { get; set; }
    }
}
