FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["HwProj.ContentService/HwProj.ContentService.API/HwProj.ContentService.API.csproj", "HwProj.ContentService/HwProj.ContentService.API/"]
COPY ["HwProj.Common/HwProj.Utils/HwProj.Utils.csproj", "HwProj.Common/HwProj.Utils/"]
COPY ["HwProj.EventBus/HwProj.EventBus.Client/HwProj.EventBus.Client.csproj", "HwProj.EventBus/HwProj.EventBus.Client/"]
COPY ["HwProj.Common/HwProj.Models/HwProj.Models.csproj", "HwProj.Common/HwProj.Models/"]
COPY ["HwProj.Common/HwProj.Repositories/HwProj.Repositories.csproj", "HwProj.Common/HwProj.Repositories/"]
RUN dotnet restore "HwProj.ContentService/HwProj.ContentService.API/HwProj.ContentService.API.csproj"
COPY . .
WORKDIR "/src/HwProj.ContentService/HwProj.ContentService.API"
RUN dotnet build "HwProj.ContentService.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "HwProj.ContentService.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "HwProj.ContentService.API.dll"]
