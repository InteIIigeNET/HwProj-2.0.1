FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["Directory.Build.props", "Directory.Build.props"]

COPY ["HwProj.NotificationsService/HwProj.NotificationsService.API/", "HwProj.NotificationsService/HwProj.NotificationsService.API/"]
COPY ["HwProj.NotificationsService/HwProj.NotificationService.Events/", "HwProj.NotificationsService/HwProj.NotificationService.Events/"]
COPY ["HwProj.Common/HwProj.Common.Net8/", "HwProj.Common/HwProj.Common.Net8/"]
COPY ["HwProj.EventBus/HwProj.EventBus.Client/", "HwProj.EventBus/HwProj.EventBus.Client/"]
COPY ["HwProj.Common/HwProj.Models/", "HwProj.Common/HwProj.Models/"]
COPY ["HwProj.Common/HwProj.Repositories/", "HwProj.Common/HwProj.Repositories/"]
COPY ["HwProj.Common/HwProj.Repositories.Net8/", "HwProj.Common/HwProj.Repositories.Net8/"]
COPY ["HwProj.SolutionsService/HwProj.SolutionsService.Client/", "HwProj.SolutionsService/HwProj.SolutionsService.Client/"]
COPY ["HwProj.Common/HwProj.Exceptions/", "HwProj.Common/HwProj.Exceptions/"]
COPY ["HwProj.Common/HwProj.HttpUtils/", "HwProj.Common/HwProj.HttpUtils/"]
COPY ["HwProj.CoursesService/HwProj.CoursesService.Client/", "HwProj.CoursesService/HwProj.CoursesService.Client/"]
COPY ["HwProj.AuthService/HwProj.AuthService.Client/", "HwProj.AuthService/HwProj.AuthService.Client/"]

COPY ["HwProj.ContentService/HwProj.ContentService.Client/", "HwProj.ContentService/HwProj.ContentService.Client/"]
COPY ["HwProj.CoursesService/HwProj.CoursesService.API/", "HwProj.CoursesService/HwProj.CoursesService.API/"]

WORKDIR "/src/HwProj.NotificationsService/HwProj.NotificationsService.API"
RUN dotnet publish "HwProj.NotificationsService.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "HwProj.NotificationsService.API.dll"]
