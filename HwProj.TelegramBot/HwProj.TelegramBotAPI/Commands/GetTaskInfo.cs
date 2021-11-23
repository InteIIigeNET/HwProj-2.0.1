using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HwProj.CoursesService.Client;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.TelegramBotAPI.Service;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.ReplyMarkups;

namespace HwProj.TelegramBotAPI.Commands
{
    public class GetTaskInfo : Commands
    {
        private readonly ICoursesServiceClient _coursesServiceClient;
        private readonly TelegramBotClient _botClient;
        private readonly IUserService _userService;

        public GetTaskInfo(TelegramBot telegramBot, ICoursesServiceClient coursesServiceClient,
            IUserService userService)
        {
            _botClient = telegramBot.GetBot().Result;
            _coursesServiceClient = coursesServiceClient;
            _userService = userService;
        }
        
        public override string Name => CommandNames.GetTaskInfo;
        
        public override async Task ExecuteAsync(Update update)
        {
            var user = await _userService.GetOrCreateChatId(update);
            var message = update.CallbackQuery.Data;
            var text = message.Split(' ');
            var hw = _coursesServiceClient.GetHomework(Int32.Parse(text[1])).Result; ////
            var tasks = hw.Tasks.ToArray();
            HomeworkTaskViewModel task = null;
            foreach (var t in tasks)
            {
                if (t.Id == Int32.Parse(text[1]))
                {
                    task = t;
                }
            }
            
            var rows = new List<InlineKeyboardButton[]>();
            var cols = new List<InlineKeyboardButton>();
            var button = GetButton("Мои курсы",  $"/courses");
            cols.Add(button);
            button = GetButton("Мои домашки", $"/homeworks {hw.CourseId}");
            cols.Add(button);
            rows.Add(cols.ToArray());
            cols = new List<InlineKeyboardButton>();
            button = GetButton("Мои задачи", $"/task {task.HomeworkId}");
            cols.Add(button);
            button = GetButton($"Решения {task.Title}", $"/solutions {task.Id}");
            cols.Add(button);
            rows.Add(cols.ToArray());
            
            var keyboardMarkup = new InlineKeyboardMarkup(rows.ToArray());
            
            await _botClient.SendTextMessageAsync(user.ChatId, 
            $"Название: {task.Title}." +
                $"\nОписание: {task.Description}." +
                $"\nДата публикации: {task.PublicationDate}." +
                $"\nДедлайн: {task.DeadlineDate}." +
                $"\nМаксимальный балл: {task.MaxRating}.",
                replyMarkup:keyboardMarkup);
        }
        
        private InlineKeyboardButton GetButton(string text, string callbackData)
            => new InlineKeyboardButton
            { 
                Text = text,
                CallbackData = callbackData
            };
    }
}