# HwProj-2.0.1
HwProj — это веб-сервис, созданный для автоматизации образовательного процесса и упрощения взаимодействия между студентами, преподавателями и экспертами из индустрии.
Платформа предлагает простой интерфейс для совместной работы, уменьшая когнитивную нагрузку на всех участников образовательного процесса.
Основной логической единицей сервиса HwProj является учебный курс, который преподаватели создают для обучения студентов. В рамках курса они
публикуют домашние работы и материалы занятий, проверяют решения студентов и формируют статистику успеваемости.
## Применение
Сервис HwProj может использоваться в курсах, где необходимо оценивать выполненные задания.

Он особенно эффективен для курсов с дедлайнами по программированию и смежным дисциплинам, где важно отслеживать результаты студентов. Работы могут загружаться в виде ссылок на внешние ресурсы, такие как GitHub, или оцениваться после очной проверки. Преподаватели могут выставлять баллы за практические задания, доклады, проекты и другие виды работ.

Чтобы узнать больше о возможностях сервиса, ознакомьтесь с [нашей документацией](Docs/documentation.pdf). Для начала работы с сервисом предлагаем воспользоваться [инструкцией](https://docs.google.com/document/d/18W-LAuG7Dq75V2p-imF2KWIWvq8MhLl2Zr3ucLQnKCY/edit?usp=sharing).

Также мы рекомендуем скачать [интерактивную презентацию](Docs/interactive_presentation.pdf), которая наглядно демонстрирует ключевые возможности сервиса.

## Обратная связь
Мы будем рады вашим вопросам, замечаниям по работе сервиса и предложениям по его улучшению. Вы можете связаться с нами, [открыв issue в репозитории](https://github.com/InteIIigeNET/HwProj-2.0.1/issues/new) или отправив сообщение в Telegram: [@yuri_ufimtsev](https://t.me/yuri_ufimtsev), [@DedSec256](https://t.me/DedSec256), [@yurii_litvinov](https://t.me/yurii_litvinov).
## Локальная сборка и запуск
### Подготовка окружения
- [.NET Core 2.2 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/2.2)
- [MS SQL LocalDB](https://learn.microsoft.com/en-us/sql/database-engine/configure-windows/sql-server-express-localdb?view=sql-server-ver16)
- - После скачивания SQL Server Installer запускаем его, выбираем Download Media, в следующем окне тыкаем на LocalDB
- Node JS, [v22.14.0](https://nodejs.org/download/release/v22.14.0/)
- Rabbit MQ, [последняя актуальная версия](https://www.rabbitmq.com/download.html)
- Java ([последняя актуальная версия](https://www.oracle.com/java/technologies/downloads/#jdk24-windows)) для генерации ts-клиента для ApiGateway
0. Открыть `HwProj-2.0.1/HwProj.sln` в Rider / Visual Studio -> Собрать решение
1. Вызвать `npm install` в `HwProj-2.0.1/hwproj.front` 
### Запуск
#### Бекенд 
В Rider - запустить конфигурацию Start All

В Visual Studio - запустить сервисы ApiGateway.API, AuthService.API, CoursesService.API, SolutionsService.API, NotificationsService.API, ContentService.API

#### Фронтенд
0. Вызвать `npm run dev` в `HwProj-2.0.1/hwproj.front` (Start All в Rider запустит и фронтенд)

### Генерация ts-клиента после изменения контрактов ApiGateway 
0. Запустить ApiGateway
1. Вызвать generate-swagger-client.ps1 в Powershell
