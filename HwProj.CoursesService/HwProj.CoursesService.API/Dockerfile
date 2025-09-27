FROM mcr.microsoft.com/dotnet/core/sdk:2.2-stretch AS build
WORKDIR /src

COPY ["Directory.Build.props", "Directory.Build.props"]

COPY ["HwProj.CoursesService/HwProj.CoursesService.API/", "HwProj.CoursesService/HwProj.CoursesService.API/"]
COPY ["HwProj.Common/HwProj.Utils/", "HwProj.Common/HwProj.Utils/"]
COPY ["HwProj.EventBus/HwProj.EventBus.Client/", "HwProj.EventBus/HwProj.EventBus.Client/"]
COPY ["HwProj.Common/HwProj.Models/", "HwProj.Common/HwProj.Models/"]
COPY ["HwProj.Common/HwProj.Repositories/", "HwProj.Common/HwProj.Repositories/"]
COPY ["HwProj.AuthService/HwProj.AuthService.Client/", "HwProj.AuthService/HwProj.AuthService.Client/"]
COPY ["HwProj.ContentService/HwProj.ContentService.Client/", "HwProj.ContentService/HwProj.ContentService.Client/"]
COPY ["HwProj.Common/HwProj.HttpUtils/", "HwProj.Common/HwProj.HttpUtils/"]
COPY ["HwProj.NotificationsService/HwProj.NotificationService.Events/", "HwProj.NotificationsService/HwProj.NotificationService.Events/"]

WORKDIR "/src/HwProj.CoursesService/HwProj.CoursesService.API"
RUN dotnet publish "HwProj.CoursesService.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/core/aspnet:2.2-stretch-slim AS final
WORKDIR /app

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "HwProj.CoursesService.API.dll"]
