using HwProj.SolutionsService.API.Models;
using HwProj.SolutionsService.API.Repositories;
using HwProj.SolutionsService.API.Services;
using HwProj.Utils.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HwProj.SolutionsService.API
{
	public class Startup
	{
		public Startup(IConfiguration configuration)
		{
			Configuration = configuration;
		}

		public IConfiguration Configuration { get; }

		public void ConfigureServices(IServiceCollection services)
		{
			var connectionString = Configuration.GetConnectionString("DefaultConnection");
			services.AddDbContext<SolutionContext>(options => options.UseSqlServer(connectionString));
			services.AddScoped<ISolutionsRepository, SolutionsRepository>();
			services.AddScoped<ISolutionsService, Services.SolutionsService>();
			services.ConfigureHwProjServices("Solutions API");
		}

		public void Configure(IApplicationBuilder app, IHostingEnvironment env)
		{
			app.ConfigureHwProj(env, "Solutions API");
		}
	}
}