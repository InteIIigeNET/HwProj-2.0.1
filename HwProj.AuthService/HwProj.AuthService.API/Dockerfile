FROM mcr.microsoft.com/dotnet/core/aspnet:2.2-stretch-slim AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/core/sdk:2.2-stretch AS build
WORKDIR /src
COPY ["HwProj.AuthService/HwProj.AuthService.API/HwProj.AuthService.API.csproj", "HwProj.AuthService/HwProj.AuthService.API/"]
COPY ["HwProj.Common/HwProj.Utils/HwProj.Utils.csproj", "HwProj.Common/HwProj.Utils/"]
COPY ["HwProj.EventBus/HwProj.EventBus.Client/HwProj.EventBus.Client.csproj", "HwProj.EventBus/HwProj.EventBus.Client/"]
COPY ["HwProj.Common/HwProj.Models/HwProj.Models.csproj", "HwProj.Common/HwProj.Models/"]
COPY ["HwProj.Common/HwProj.Repositories/HwProj.Repositories.csproj", "HwProj.Common/HwProj.Repositories/"]
RUN dotnet restore "HwProj.AuthService/HwProj.AuthService.API/HwProj.AuthService.API.csproj"
COPY . .
WORKDIR "/src/HwProj.AuthService/HwProj.AuthService.API"
RUN dotnet build "HwProj.AuthService.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "HwProj.AuthService.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "HwProj.AuthService.API.dll"]
