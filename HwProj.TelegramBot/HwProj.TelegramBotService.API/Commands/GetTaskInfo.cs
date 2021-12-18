using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HwProj.CoursesService.Client;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.TelegramBotService.API.Service;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;
using Telegram.Bot.Types.ReplyMarkups;

namespace HwProj.TelegramBotService.API.Commands
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
            var user = await _userService.UserByUpdate(update);
            var message = update.CallbackQuery.Data;
            var text = message.Split(' ');
            var task = _coursesServiceClient.GetTask(Int64.Parse(text[1])).Result;
            var hw = _coursesServiceClient.GetHomework(task.HomeworkId).Result;
            
            var rows = new List<InlineKeyboardButton[]>();
            var cols = new List<InlineKeyboardButton>();
            cols.Add(GetButton($"Решения {task.Title}", $"/solutions {task.Id}"));
            rows.Add(cols.ToArray());
            cols = new List<InlineKeyboardButton>();
            cols.Add(GetButton("Мои курсы",  $"/courses"));
            cols.Add(GetButton("Мои домашки", $"/homeworks {hw.CourseId}"));
            cols.Add(GetButton("Мои задачи", $"/task {task.HomeworkId}"));
            rows.Add(cols.ToArray());
            
            var keyboardMarkup = new InlineKeyboardMarkup(rows.ToArray());

            await _botClient.SendTextMessageAsync(user.ChatId, 
            $"<b>Название</b> {task.Title}." +
                $"\n<b>Описание:</b> {task.Description}." +
                $"\n<b>Дата публикации:</b> {task.PublicationDate.Date}." +
                $"\n<b>Дедлайн:</b> {task.DeadlineDate}." +
                $"\n<b>Максимальный балл:</b> {task.MaxRating}.",
            ParseMode.Html,
                replyMarkup:keyboardMarkup);
        }
    }
}