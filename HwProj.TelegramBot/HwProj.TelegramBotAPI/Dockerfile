FROM mcr.microsoft.com/dotnet/aspnet:5.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
WORKDIR /src
COPY ["HwProj.TelegramBot/HwProj.TelegramBotAPI/HwProj.TelegramBotAPI.csproj", "HwProj.TelegramBotAPI/"]
RUN dotnet restore "HwProj.TelegramBot/HwProj.TelegramBotAPI/HwProj.TelegramBotAPI.csproj"
COPY . .
WORKDIR "/src/HwProj.TelegramBotAPI"
RUN dotnet build "HwProj.TelegramBotAPI.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "HwProj.TelegramBotAPI.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "HwProj.TelegramBotAPI.dll"]
