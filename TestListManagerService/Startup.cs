using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FirstTestUserService.EventHandlers;
using FirstTestUserService.Events;
using HwProj.EventBus;
using HwProj.Utils.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FirstTestUserService
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
            string con = "Server=(localdb)\\mssqllocaldb;Database=usersdbstore;Trusted_Connection=True;MultipleActiveResultSets=true";
            services.AddDbContext<UsersContext>(options => options.UseSqlServer(con));
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);
            services.AddEventBus(Configuration);
            services.AddTransient<AddEventHandler>();
            services.AddTransient<UpdateEventHandler>();
            services.AddTransient<DeleteEventHandler>();
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env, IEventBus eventBus)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseMvc();

            eventBus.Subscribe<AddEvent, AddEventHandler>();
            eventBus.Subscribe<UpdateEvent, UpdateEventHandler>();
            eventBus.Subscribe<DeleteEvent, DeleteEventHandler>();

        }
    }
}
