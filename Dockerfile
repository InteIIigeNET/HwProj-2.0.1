FROM mcr.microsoft.com/dotnet/core/aspnet:2.1 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/core/sdk:2.1 AS publish
WORKDIR /src
COPY . .

RUN dotnet publish /src/HwProj.AuthService/HwProj.AuthService.API/HwProj.AuthService.API.csproj -c Release -o /app 

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "HwProj.AuthService.API.dll"]