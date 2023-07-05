# HwProj-2.0.1
Сервис для взаимодействия студентов с преподавателями

## Подготовка окружения

- [.NET Core 2.2 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/2.2)
- [MS SQL LocalDB](https://learn.microsoft.com/en-us/sql/database-engine/configure-windows/sql-server-express-localdb?view=sql-server-ver16) 
- Node JS, [последняя актуальная версия](https://nodejs.org/en)
- Rabbit MQ, [последняя актуальная версия](https://www.rabbitmq.com/download.html)

0. Открыть `HwProj-2.0.1/HwProj.sln` в Rider / Visual Studio -> Собрать решение
1. Вызвать `npm install` в `HwProj-2.0.1/hwproj.front` 

## Запуск
### Бекенд 
В Rider - запустить конфигурация Start All

В Visual Studio - запустить сервисы ApiGateway.API, AuthService.API, CoursesService.API, SolutionsService.API, NotificationsService.API

### Фронтенд
0. _Добавить .env файл с секретами_
1. Вызвать `npm start` в `HwProj-2.0.1/hwproj.front` (или в IDE)
