using System.Collections.Generic;
using System.Threading.Tasks;
using HwProj.CoursesService.Client;
using HwProj.TelegramBotAPI.Service;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.ReplyMarkups;

namespace HwProj.TelegramBotAPI.Commands
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
            var courses = _coursesServiceClient.GetAllUserCourses(user.StudentId).Result;
            
            var rows = new List<InlineKeyboardButton[]>();
            var cols = new List<InlineKeyboardButton>();
            for (var i = 1; i < courses.Length + 1; i++)
            {
                var k = new InlineKeyboardButton
                { 
                    Text = courses[i - 1].Name,
                    CallbackData = $"/homeworks {courses[i - 1].Id}"
                };
                cols.Add(k);
                if (i % 3 != 0) continue;
                rows.Add(cols.ToArray());
                cols = new List<InlineKeyboardButton>();
            }

            if (courses.Length < 3)
            {
                rows.Add(cols.ToArray());
            }
            var keyboardMarkup = new InlineKeyboardMarkup(rows.ToArray());
            
            await _botClient.SendTextMessageAsync(user.ChatId, "Выберите курс:", replyMarkup:keyboardMarkup);
        }
    }
}