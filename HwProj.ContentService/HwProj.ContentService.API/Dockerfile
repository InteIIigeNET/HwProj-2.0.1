FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["Directory.Build.props", "Directory.Build.props"]

COPY ["HwProj.ContentService/HwProj.ContentService.API/", "HwProj.ContentService/HwProj.ContentService.API/"]
COPY ["HwProj.Common/HwProj.Utils/", "HwProj.Common/HwProj.Utils/"]
COPY ["HwProj.EventBus/HwProj.EventBus.Client/", "HwProj.EventBus/HwProj.EventBus.Client/"]
COPY ["HwProj.Common/HwProj.Models/", "HwProj.Common/HwProj.Models/"]
COPY ["HwProj.Common/HwProj.Repositories/", "HwProj.Common/HwProj.Repositories/"]

WORKDIR "/src/HwProj.ContentService/HwProj.ContentService.API"
RUN dotnet publish "HwProj.ContentService.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "HwProj.ContentService.API.dll"]
