using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Repositories;
using HwProj.CoursesService.Client;
using HwProj.TelegramBotAPI.Service;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.ReplyMarkups;

namespace HwProj.TelegramBotAPI.Commands
{
    public class GetHomeworks : Commands
    {
        private readonly ICoursesServiceClient _coursesServiceClient;
        private readonly TelegramBotClient _botClient;
        private readonly IUserService _userService;

        public GetHomeworks(TelegramBot telegramBot, ICoursesServiceClient coursesServiceClient, IUserService userService)
        {
            _botClient = telegramBot.GetBot().Result;
            _coursesServiceClient = coursesServiceClient;
            _userService = userService;
        }

        public override string Name => CommandNames.GetHomeworks;
        
        public override async Task ExecuteAsync(Update update)
        {
            var user = await _userService.GetOrCreateChatId(update);
            var message = update.CallbackQuery.Data;
            var text = message.Split(' ');
            var homeworks = _coursesServiceClient.GetAllHomeworkByCourse(Int32.Parse(text[1])).Result;
            
            var rows = new List<InlineKeyboardButton[]>();
            var cols = new List<InlineKeyboardButton>();
            for (var i = 1; i < homeworks.Length + 1; i++)
            {
                var k = new InlineKeyboardButton
                { 
                    Text = homeworks[i - 1].Title,
                    CallbackData = $"/homeworks "
                };
                cols.Add(k);
                if (i % 3 != 0) continue;
                rows.Add(cols.ToArray());
                cols = new List<InlineKeyboardButton>();
            }

            if (homeworks.Length < 3)
            {
                rows.Add(cols.ToArray());
            }
            var keyboardMarkup = new InlineKeyboardMarkup(rows.ToArray());
            await _botClient.SendTextMessageAsync(user.ChatId, "Выберите homework:", replyMarkup:keyboardMarkup);
        }
    }
}