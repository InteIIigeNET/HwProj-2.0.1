FROM mcr.microsoft.com/dotnet/sdk:6.0  AS build
WORKDIR /src
COPY ["HwProj.AuthService/HwProj.AuthService.API/HwProj.AuthService.API.csproj", "HwProj.AuthService/HwProj.AuthService.API/"]
COPY ["HwProj.Common/HwProj.Utils/HwProj.Utils.csproj", "HwProj.Common/HwProj.Utils/"]
COPY ["HwProj.EventBus/HwProj.EventBus.Client/HwProj.EventBus.Client.csproj", "HwProj.EventBus/HwProj.EventBus.Client/"]
COPY ["HwProj.Common/HwProj.Models/HwProj.Models.csproj", "HwProj.Common/HwProj.Models/"]
COPY ["HwProj.Common/HwProj.Repositories/HwProj.Repositories.csproj", "HwProj.Common/HwProj.Repositories/"]
COPY . .
WORKDIR "/src/HwProj.AuthService/HwProj.AuthService.API"
RUN dotnet publish "HwProj.AuthService.API.csproj" -c Release -o /app/publish

FROM build AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "HwProj.AuthService.API.dll"]
