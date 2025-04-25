FROM mcr.microsoft.com/dotnet/core/sdk:2.2-stretch AS build
WORKDIR /src

COPY ["Directory.Build.props", "Directory.Build.props"]

COPY ["HwProj.SolutionsService/HwProj.SolutionsService.API/", "HwProj.SolutionsService/HwProj.SolutionsService.API/"]
COPY ["HwProj.SolutionsService/HwProj.SolutionsService.Client/", "HwProj.SolutionsService/HwProj.SolutionsService.Client/"]
COPY ["HwProj.Common/HwProj.Models/", "HwProj.Common/HwProj.Models/"]
COPY ["HwProj.Common/HwProj.Repositories/", "HwProj.Common/HwProj.Repositories/"]
COPY ["HwProj.Common/HwProj.Exceptions/", "HwProj.Common/HwProj.Exceptions/"]
COPY ["HwProj.Common/HwProj.HttpUtils/", "HwProj.Common/HwProj.HttpUtils/"]
COPY ["HwProj.Common/HwProj.Utils/", "HwProj.Common/HwProj.Utils/"]
COPY ["HwProj.EventBus/HwProj.EventBus.Client/", "HwProj.EventBus/HwProj.EventBus.Client/"]
COPY ["HwProj.CoursesService/HwProj.CoursesService.Client/", "HwProj.CoursesService/HwProj.CoursesService.Client/"]
COPY ["HwProj.AuthService/HwProj.AuthService.Client/", "HwProj.AuthService/HwProj.AuthService.Client/"]

WORKDIR "/src/HwProj.SolutionsService/HwProj.SolutionsService.API"
RUN dotnet publish "HwProj.SolutionsService.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/core/aspnet:2.2-stretch-slim AS final
WORKDIR /app

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "HwProj.SolutionsService.API.dll"]
