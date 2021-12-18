using System;
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
            var user = await _userService.UserByUpdate(update);
            var message = update.CallbackQuery.Data;
            var text = message.Split(' ');
            var hw = _coursesServiceClient.GetHomework(Int32.Parse(text[1])).Result;
            var course = _coursesServiceClient.GetCourseById(hw.CourseId, user.AccountId).Result;
            var tasks = hw.Tasks.ToArray();
            var rows = new List<InlineKeyboardButton[]>();
            var cols = new List<InlineKeyboardButton>();
            for (var i = 1; i < tasks.Length + 1; i++)
            {
                cols.Add(GetButton(tasks[i - 1].Title, $"/taskinfo {tasks[i - 1].Id}"));
                if (i % 3 != 0) continue;
                rows.Add(cols.ToArray());
                cols = new List<InlineKeyboardButton>();
            }

            if (tasks.Length < 3)
            {
                rows.Add(cols.ToArray());
            }
            
            cols = new List<InlineKeyboardButton>();
            cols.Add(GetButton("Мои курсы", $"/courses"));
            cols.Add(GetButton("Мои домашки", $"/homeworks {hw.CourseId}"));
            rows.Add(cols.ToArray());
            
            var keyboardMarkup = new InlineKeyboardMarkup(rows.ToArray());
            await _botClient.SendTextMessageAsync(
                user.ChatId,
             $"<b>Курс:</b> {course.Name}" + 
                $"\n<b>Homework:</b> {hw.Title}" +
                $"\n<b>Описание:</b> {hw.Description}" +
                "\n<b>Выберите задачу:</b>", 
                ParseMode.Html,
                replyMarkup:keyboardMarkup);
        }
    }
}