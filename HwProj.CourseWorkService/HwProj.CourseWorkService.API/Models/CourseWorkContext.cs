using System;
using System.Linq;
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
		public DbSet<DeadlineType> DeadlineTypes { get; set; }
        public DbSet<WorkFile> WorkFiles { get; set; }
        public DbSet<FileType> FileTypes { get; set; }
		public DbSet<User> Users { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<StudentProfile> StudentProfiles { get; set; }
        public DbSet<LecturerProfile> LecturerProfiles { get; set; }
        public DbSet<ReviewerProfile> ReviewerProfiles { get; set; }
        public DbSet<CuratorProfile> CuratorProfiles { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Direction> Directions { get; set; }
		public DbSet<ReviewersInCuratorsBidding> ReviewersInCuratorsBidding { get; set; }
		public DbSet<Bid> Bids { get; set; }

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
	        return Enum.GetValues(typeof(Roles)).OfType<Roles>()
		        .Select(role =>
			        new Role
			        {
				        Id = (long) role, DisplayValue = Enum.GetName(typeof(Roles), role)
			        })
		        .ToArray();
        }

        private static FileType[] GetInitFileTypes()
        {
	        return Enum.GetValues(typeof(FileTypes)).OfType<FileTypes>()
		        .Select(fileType => 
			        new FileType
			        {
				        Id = (long) fileType, DisplayValue = Enum.GetName(typeof(FileTypes), fileType)
			        })
		        .ToArray();
        }

        private static DeadlineType[] GetInitDeadlineTypes()
        {
	        return Enum.GetValues(typeof(DeadlineTypes)).OfType<DeadlineTypes>()
		        .Select(deadlineType =>
			        new DeadlineType
					{
				        Id = (long)deadlineType,
				        DisplayValue = Enum.GetName(typeof(DeadlineTypes), deadlineType)
			        })
		        .ToArray();
        }

		#endregion

		#region Methods: Protected

		protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

	        modelBuilder.Entity<Role>().HasData(GetInitRoles());
	        modelBuilder.Entity<FileType>().HasData(GetInitFileTypes());
	        modelBuilder.Entity<DeadlineType>().HasData(GetInitDeadlineTypes());

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
