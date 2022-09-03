FROM mcr.microsoft.com/dotnet/core/aspnet:2.2-stretch-slim AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/core/sdk:2.2-stretch AS build
WORKDIR /src
COPY ["HwProj.SolutionsService/HwProj.SolutionsService.API/HwProj.SolutionsService.API.csproj", "HwProj.SolutionsService/HwProj.SolutionsService.API/"]
COPY ["HwProj.SolutionsService/HwProj.SolutionsService.Client/HwProj.SolutionsService.Client.csproj", "HwProj.SolutionsService/HwProj.SolutionsService.Client/"]
COPY ["HwProj.Common/HwProj.Models/HwProj.Models.csproj", "HwProj.Common/HwProj.Models/"]
COPY ["HwProj.Common/HwProj.Repositories/HwProj.Repositories.csproj", "HwProj.Common/HwProj.Repositories/"]
COPY ["HwProj.Common/HwProj.Exceptions/HwProj.Exceptions.csproj", "HwProj.Common/HwProj.Exceptions/"]
COPY ["HwProj.Common/HwProj.HttpUtils/HwProj.HttpUtils.csproj", "HwProj.Common/HwProj.HttpUtils/"]
COPY ["HwProj.Common/HwProj.Utils/HwProj.Utils.csproj", "HwProj.Common/HwProj.Utils/"]
COPY ["HwProj.EventBus/HwProj.EventBus.Client/HwProj.EventBus.Client.csproj", "HwProj.EventBus/HwProj.EventBus.Client/"]
COPY ["HwProj.CoursesService/HwProj.CoursesService.Client/HwProj.CoursesService.Client.csproj", "HwProj.CoursesService/HwProj.CoursesService.Client/"]
COPY ["HwProj.AuthService/HwProj.AuthService.Client/HwProj.AuthService.Client.csproj", "HwProj.AuthService/HwProj.AuthService.Client/"]
RUN dotnet restore "HwProj.SolutionsService/HwProj.SolutionsService.API/HwProj.SolutionsService.API.csproj"
COPY . .
WORKDIR /src/HwProj.SolutionsService/HwProj.SolutionsService.API
RUN dotnet build "HwProj.SolutionsService.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "HwProj.SolutionsService.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "HwProj.SolutionsService.API.dll"]
