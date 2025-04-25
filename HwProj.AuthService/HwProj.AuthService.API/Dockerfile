FROM mcr.microsoft.com/dotnet/core/sdk:2.2-stretch AS build
WORKDIR /src

COPY ["Directory.Build.props", "Directory.Build.props"]

COPY ["HwProj.AuthService/HwProj.AuthService.API/", "HwProj.AuthService/HwProj.AuthService.API/"]
COPY ["HwProj.Common/HwProj.Utils/", "HwProj.Common/HwProj.Utils/"]
COPY ["HwProj.EventBus/HwProj.EventBus.Client/", "HwProj.EventBus/HwProj.EventBus.Client/"]
COPY ["HwProj.Common/HwProj.Models/", "HwProj.Common/HwProj.Models/"]
COPY ["HwProj.Common/HwProj.Repositories/", "HwProj.Common/HwProj.Repositories/"]

WORKDIR "/src/HwProj.AuthService/HwProj.AuthService.API"
RUN dotnet publish "HwProj.AuthService.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/core/aspnet:2.2-stretch-slim AS final
WORKDIR /app

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "HwProj.AuthService.API.dll"]
