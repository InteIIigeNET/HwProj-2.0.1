using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HwProj.CoursesService.Client;
using HwProj.TelegramBotAPI.Service;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.ReplyMarkups;

namespace HwProj.TelegramBotAPI.Commands
{
    public class GetTasks : Commands
    {
        private readonly ICoursesServiceClient _coursesServiceClient;
        private readonly TelegramBotClient _botClient;
        private readonly IUserService _userService;

        public GetTasks(TelegramBot telegramBot, ICoursesServiceClient coursesServiceClient,
            IUserService userService)
        {
            _botClient = telegramBot.GetBot().Result;
            _coursesServiceClient = coursesServiceClient;
            _userService = userService;
        }
        
        public override string Name => CommandNames.GetTasks;
        
        public override async Task ExecuteAsync(Update update)
        {
            var user = await _userService.GetOrCreateChatId(update);
            var message = update.CallbackQuery.Data;
            var text = message.Split(' ');
            var hw = _coursesServiceClient.GetHomework(Int32.Parse(text[1])).Result;
            var tasks = hw.Tasks.ToArray();
            var rows = new List<InlineKeyboardButton[]>();
            var cols = new List<InlineKeyboardButton>();
            for (var i = 1; i < tasks.Length + 1; i++)
            {
                var k = new InlineKeyboardButton
                { 
                    Text = tasks[i - 1].Title,
                    CallbackData = $"/taskinfo {tasks[i - 1].Id}"
                };
                cols.Add(k);
                if (i % 3 != 0) continue;
                rows.Add(cols.ToArray());
                cols = new List<InlineKeyboardButton>();
            }

            if (tasks.Length < 3)
            {
                rows.Add(cols.ToArray());
            }
            
            var button = new InlineKeyboardButton
            { 
                Text = "Мои курсы",
                CallbackData = $"/courses"
            };
            cols = new List<InlineKeyboardButton>();
            cols.Add(button);
            button = new InlineKeyboardButton
            { 
                Text = "Мои домашки",
                CallbackData = $"/homeworks {hw.CourseId}"
            };
            cols.Add(button);
            rows.Add(cols.ToArray());
            
            var keyboardMarkup = new InlineKeyboardMarkup(rows.ToArray());
            await _botClient.SendTextMessageAsync(user.ChatId, "Выберите task:", replyMarkup:keyboardMarkup);
        }
    }
}