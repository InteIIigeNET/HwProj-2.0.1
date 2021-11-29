using System.Collections.Generic;
using System.Threading.Tasks;
using HwProj.CoursesService.Client;
using HwProj.TelegramBotService.API.Service;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;
using Telegram.Bot.Types.ReplyMarkups;

namespace HwProj.TelegramBotService.API.Commands
{
    public class GetCourses : Commands
    {
        private readonly ICoursesServiceClient _coursesServiceClient;
        private readonly TelegramBotClient _botClient;
        private readonly IUserService _userService;

        public GetCourses(TelegramBot telegramBot, ICoursesServiceClient coursesServiceClient, IUserService userService)
        {
            _botClient = telegramBot.GetBot().Result;
            _coursesServiceClient = coursesServiceClient;
            _userService = userService;
        }

        public override string Name => CommandNames.GetCourses;
        
        public override async Task ExecuteAsync(Update update)
        {
            var user = await _userService.GetOrCreateChatId(update);
            var courses = _coursesServiceClient.GetAllUserCourses(user.AccountId).Result;
            
            await _botClient.SendTextMessageAsync(user.ChatId, "*Выберите курс для просмотра домашних работ или статистики:*", ParseMode.Markdown);
            
            foreach (var course in courses)
            {
                var rows = new List<InlineKeyboardButton[]>();
                var cols = new List<InlineKeyboardButton>();
                cols.Add(GetButton("Домашние работы", $"/homeworks {course.Id}"));
                cols.Add(GetButton("Cтатистика", $"/statistics {course.Id}"));
                rows.Add(cols.ToArray());
                var keyboardMarkup = new InlineKeyboardMarkup(rows.ToArray());
                await _botClient.SendTextMessageAsync(user.ChatId, "<b>Курс:</b>" + $" {course.Name}", parseMode: ParseMode.Html, replyMarkup:keyboardMarkup);
            }
        }
    }
}