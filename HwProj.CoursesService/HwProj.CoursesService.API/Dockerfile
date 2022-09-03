FROM mcr.microsoft.com/dotnet/core/aspnet:2.2-stretch-slim AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/core/sdk:2.2-stretch AS build
WORKDIR /src
COPY ["HwProj.CoursesService/HwProj.CoursesService.API/HwProj.CoursesService.API.csproj", "HwProj.CoursesService/HwProj.CoursesService.API/"]
COPY ["HwProj.Common/HwProj.Utils/HwProj.Utils.csproj", "HwProj.Common/HwProj.Utils/"]
COPY ["HwProj.EventBus/HwProj.EventBus.Client/HwProj.EventBus.Client.csproj", "HwProj.EventBus/HwProj.EventBus.Client/"]
COPY ["HwProj.Common/HwProj.Models/HwProj.Models.csproj", "HwProj.Common/HwProj.Models/"]
COPY ["HwProj.Common/HwProj.Repositories/HwProj.Repositories.csproj", "HwProj.Common/HwProj.Repositories/"]
COPY ["HwProj.AuthService/HwProj.AuthService.Client/HwProj.AuthService.Client.csproj", "HwProj.AuthService/HwProj.AuthService.Client/"]
COPY ["HwProj.Common/HwProj.HttpUtils/HwProj.HttpUtils.csproj", "HwProj.Common/HwProj.HttpUtils/"]
RUN dotnet restore "HwProj.CoursesService/HwProj.CoursesService.API/HwProj.CoursesService.API.csproj"
COPY . .
WORKDIR "/src/HwProj.CoursesService/HwProj.CoursesService.API"
RUN dotnet build "HwProj.CoursesService.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "HwProj.CoursesService.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "HwProj.CoursesService.API.dll"]
