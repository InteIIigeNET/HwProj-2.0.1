using System;
using System.Collections.Generic;
using HwProj.CourseWorkService.API.Models.UserInfo;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CourseWorkService.API.Models
{
    public sealed class CourseWorkContext : DbContext
    {
        #region Properties: Public

        public DbSet<CourseWork> CourseWorks { get; set; }
        public DbSet<Application> Applications { get; set; }
        public DbSet<Deadline> Deadlines { get; set; }
		public DbSet<FileType> FileTypes { get; set; }
        public DbSet<WorkFile> WorkFiles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<StudentProfile> StudentProfiles { get; set; }
        public DbSet<LecturerProfile> LecturerProfiles { get; set; }
        public DbSet<ReviewerProfile> ReviewerProfiles { get; set; }
        public DbSet<CuratorProfile> CuratorProfiles { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Direction> Directions { get; set; }

        #endregion

        #region Constructors: Public

        public CourseWorkContext(DbContextOptions<CourseWorkContext> options)
	        : base(options)
        {
	        Database.EnsureCreated();
        }

        #endregion

        #region Methods: Private

        private static Role[] GetInitRoles()
        {
            var roles = new List<Role>();

	        foreach (Roles role in Enum.GetValues(typeof(Roles)))
	        {
		        string displayName;

		        switch (role)
		        {
			        case UserInfo.Roles.Student:
			        {
				        displayName = "Student";
				        break;
			        }
			        case UserInfo.Roles.Lecturer:
			        {
				        displayName = "Lecturer";
				        break;
			        }
			        case UserInfo.Roles.Reviewer:
			        {
				        displayName = "Reviewer";
				        break;
			        }
			        case UserInfo.Roles.Curator:
			        {
				        displayName = "Curator";
				        break;
			        }
			        default:
			        {
						continue;
			        }
				}
                roles.Add(new Role() { Id = (long)role, DisplayValue = displayName});
	        }

	        return roles.ToArray();
        }

        private static FileType[] GetInitFileTypes()
        {
	        var fileTypes = new List<FileType>();

	        foreach (FileTypes fileType in Enum.GetValues(typeof(FileTypes)))
	        {
		        string displayName;

		        switch (fileType)
		        {
			        case Models.FileTypes.CourseWorkText:
			        {
				        displayName = "CourseWorkText";
				        break;
			        }
					case Models.FileTypes.Presentation:
					{
						displayName = "Presentation";
						break;
					}
			        case Models.FileTypes.Review:
			        {
				        displayName = "Review";
				        break;
			        }
			        case Models.FileTypes.LecturerComment:
			        {
				        displayName = "LecturerComment";
				        break;
			        }
			        case Models.FileTypes.Other:
			        {
				        displayName = "Other";
				        break;
			        }
					default:
			        {
				        continue;
			        }
		        }
		        fileTypes.Add(new FileType() { Id = (long)fileType, DisplayValue = displayName });
	        }

	        return fileTypes.ToArray();
		}

		#endregion

		#region Methods: Protected

		protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

	        modelBuilder.Entity<Role>().HasData(GetInitRoles());

	        modelBuilder.Entity<FileType>().HasData(GetInitFileTypes());

	        modelBuilder.Entity<UserRole>()
		        .HasKey(ur => new { ur.UserId, ur.RoleId });

	        modelBuilder.Entity<UserRole>()
		        .HasOne(ur => ur.User)
		        .WithMany(u => u.UserRoles)
		        .HasForeignKey(ur => ur.UserId);

	        modelBuilder.Entity<UserRole>()
		        .HasOne(ur => ur.Role)
		        .WithMany(r => r.UserRoles)
		        .HasForeignKey(ur => ur.RoleId);
        }

        #endregion
    }
}
