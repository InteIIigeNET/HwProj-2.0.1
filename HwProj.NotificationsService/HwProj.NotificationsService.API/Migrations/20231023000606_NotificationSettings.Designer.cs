﻿// <auto-generated />
using System;
using HwProj.NotificationsService.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace HwProj.NotificationsService.API.Migrations
{
    [DbContext(typeof(NotificationsContext))]
    [Migration("20231023000606_NotificationSettings")]
    partial class NotificationSettings
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "2.2.6-servicing-10079")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("HwProj.Models.NotificationsService.Notification", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Body");

                    b.Property<int>("Category");

                    b.Property<DateTime>("Date");

                    b.Property<bool>("HasSeen");

                    b.Property<string>("Owner");

                    b.Property<string>("Sender");

                    b.HasKey("Id");

                    b.ToTable("Notifications");
                });

            modelBuilder.Entity("HwProj.NotificationsService.API.Models.NotificationsSetting", b =>
                {
                    b.Property<string>("UserId");

                    b.Property<string>("Category");

                    b.Property<bool>("IsEnabled");

                    b.HasKey("UserId", "Category");

                    b.HasIndex("UserId");

                    b.ToTable("Settings");
                });
#pragma warning restore 612, 618
        }
    }
}
