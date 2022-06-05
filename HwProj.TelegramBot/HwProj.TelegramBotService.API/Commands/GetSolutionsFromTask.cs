using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HwProj.SolutionsService.Client;
using HwProj.TelegramBotService.API.Service;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;
using Telegram.Bot.Types.ReplyMarkups; 
using HwProj.CoursesService.Client;

namespace HwProj.TelegramBotService.API.Commands
{
    public class GetSolutionsFromTask: Commands
    {
        private readonly TelegramBotClient _botClient;
        private readonly IUserTelegramService _userTelegramService;
        private readonly ISolutionsServiceClient _solutionsServiceClient;
        private readonly ICoursesServiceClient _coursesServiceClient;

        public GetSolutionsFromTask(TelegramBot telegramBot, IUserTelegramService userTelegramService, ISolutionsServiceClient solutionsServiceClient, ICoursesServiceClient coursesServiceClient)
        {
            _botClient = telegramBot.GetBot().Result;
            _solutionsServiceClient = solutionsServiceClient;
            _userTelegramService = userTelegramService;
            _coursesServiceClient = coursesServiceClient;
        }

        public override string Name => CommandNames.GetSolutionsFromTask;
        
        public override async Task ExecuteAsync(Update update)
        {
            var user = await _userTelegramService.UserByUpdate(update);
            var message = update.CallbackQuery.Data;
            var text = message.Split(' ');
            var solutions = _solutionsServiceClient.GetUserSolution(Int32.Parse(text[1]), user.AccountId).Result;
            var task = _coursesServiceClient.GetTask(Int32.Parse(text[1])).Result;
            var hw = _coursesServiceClient.GetHomework(task.HomeworkId).Result;
            var course = _coursesServiceClient.GetCourseById(hw.CourseId, user.AccountId).Result;
            
            var rows = new List<InlineKeyboardButton[]>();
            var cols = new List<InlineKeyboardButton>();
            for (var i = 1; i < solutions.Length + 1; i++)
            {
                cols.Add(GetButton($"Попытка {i}", $"/solutioninfo {solutions[i - 1].Id}"));
                if (i % 3 != 0) continue;
                rows.Add(cols.ToArray());
                cols = new List<InlineKeyboardButton>();
            }
            
            rows.Add(cols.ToArray());
            cols = new List<InlineKeyboardButton>();
            cols.Add(GetButton("Мои курсы", $"/courses"));
            cols.Add(GetButton("Мои домашки", $"/homeworks {hw.CourseId}"));
            cols.Add(GetButton("Мои задачи", $"/task {task.HomeworkId}"));
            rows.Add(cols.ToArray());
            
            var keyboardMarkup = new InlineKeyboardMarkup(rows.ToArray());

            await _botClient.SendTextMessageAsync(user.ChatId, 
                $"<b>Курс:</b> {course.Name}" +
                $"\n<b>Домашнаяя работа:</b> {hw.Title}" + 
                $"\n<b>Задача:</b> {task.Title}" + 
                "\n<b>Выберите решение:</b>",
                ParseMode.Html,
                replyMarkup : keyboardMarkup);
        }
    }
}