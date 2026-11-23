FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["Directory.Build.props", "Directory.Build.props"]
COPY ["Net8.props", "Net8.props"]

COPY ["HwProj.ContentService/HwProj.ContentService.API/", "HwProj.ContentService/HwProj.ContentService.API/"]
COPY ["HwProj.Common/HwProj.Common.Net8/", "HwProj.Common/HwProj.Common.Net8/"]
COPY ["HwProj.Common/HwProj.Models/", "HwProj.Common/HwProj.Models/"]

WORKDIR "/src/HwProj.ContentService/HwProj.ContentService.API"
RUN dotnet publish "HwProj.ContentService.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "HwProj.ContentService.API.dll"]
