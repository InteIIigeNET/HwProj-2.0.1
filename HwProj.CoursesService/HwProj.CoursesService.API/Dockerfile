FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["Directory.Build.props", "Directory.Build.props"]

COPY ["HwProj.CoursesService/HwProj.CoursesService.API/", "HwProj.CoursesService/HwProj.CoursesService.API/"]
COPY ["HwProj.Common/HwProj.Utils/", "HwProj.Common/HwProj.Utils/"]
COPY ["HwProj.Common/HwProj.Exceptions/", "HwProj.Common/HwProj.Exceptions/"]
COPY ["HwProj.EventBus/HwProj.EventBus.Client/", "HwProj.EventBus/HwProj.EventBus.Client/"]
COPY ["HwProj.Common/HwProj.Common.Net8/", "HwProj.Common/HwProj.Common.Net8/"]
COPY ["HwProj.Common/HwProj.Repositories.Net8/", "HwProj.Common/HwProj.Repositories.Net8/"]
COPY ["HwProj.AuthService/HwProj.AuthService.Client/", "HwProj.AuthService/HwProj.AuthService.Client/"]
COPY ["HwProj.ContentService/HwProj.ContentService.Client/", "HwProj.ContentService/HwProj.ContentService.Client/"]
COPY ["HwProj.Common/HwProj.HttpUtils/", "HwProj.Common/HwProj.HttpUtils/"]
COPY ["HwProj.NotificationsService/HwProj.NotificationService.Events/", "HwProj.NotificationsService/HwProj.NotificationService.Events/"]

WORKDIR "/src/HwProj.CoursesService/HwProj.CoursesService.API"
RUN dotnet publish "HwProj.CoursesService.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "HwProj.CoursesService.API.dll"]
