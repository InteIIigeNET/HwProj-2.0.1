FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["Directory.Build.props", "Directory.Build.props"]
COPY ["Net8.props", "Net8.props"]
COPY ["Net8.Service.props", "Net8.Service.props"]

COPY ["HwProj.SolutionsService/HwProj.SolutionsService.API/", "HwProj.SolutionsService/HwProj.SolutionsService.API/"]
COPY ["HwProj.Common/HwProj.Common.Net8/", "HwProj.Common/HwProj.Common.Net8/"]
COPY ["HwProj.Common/HwProj.Repositories.Net8/", "HwProj.Common/HwProj.Repositories.Net8/"]
COPY ["HwProj.Common/HwProj.Models/", "HwProj.Common/HwProj.Models/"]
COPY ["HwProj.Common/HwProj.Exceptions/", "HwProj.Common/HwProj.Exceptions/"]
COPY ["HwProj.Common/HwProj.HttpUtils/", "HwProj.Common/HwProj.HttpUtils/"]
COPY ["HwProj.EventBus/HwProj.EventBus.Client/", "HwProj.EventBus/HwProj.EventBus.Client/"]
COPY ["HwProj.CoursesService/HwProj.CoursesService.Client/", "HwProj.CoursesService/HwProj.CoursesService.Client/"]
COPY ["HwProj.AuthService/HwProj.AuthService.Client/", "HwProj.AuthService/HwProj.AuthService.Client/"]
COPY ["HwProj.NotificationsService/HwProj.NotificationService.Events/", "HwProj.NotificationsService/HwProj.NotificationService.Events/"]

WORKDIR "/src/HwProj.SolutionsService/HwProj.SolutionsService.API"
RUN dotnet publish "HwProj.SolutionsService.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "HwProj.SolutionsService.API.dll"]
