using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HwProj.SolutionsService.Client;
using HwProj.TelegramBotService.API.Service;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;
using Telegram.Bot.Types.ReplyMarkups; /*using HwProj.CoursesService.Client;*/

namespace HwProj.TelegramBotService.API.Commands
{
    public class GetSolutionsFromTask: Commands
    {
        private readonly TelegramBotClient _botClient;
        private readonly IUserService _userService;
        private readonly SolutionsServiceClient _solutionsServiceClient;
        /*private readonly CoursesServiceClient _coursesServiceClient;*/

        public GetSolutionsFromTask(TelegramBot telegramBot, IUserService userService, SolutionsServiceClient solutionsServiceClient/*, CoursesServiceClient coursesServiceClient*/)
        {
            _botClient = telegramBot.GetBot().Result;
            _userService = userService;
            _solutionsServiceClient = solutionsServiceClient;
            /*_coursesServiceClient = coursesServiceClient;*/
        }

        public override string Name => CommandNames.GetSolutionsFromTask;
        
        public override async Task ExecuteAsync(Update update)
        {
            var user = await _userService.GetOrCreateChatId(update);
            var message = update.CallbackQuery.Data;
            var text = message.Split(' ');
            var solutions = _solutionsServiceClient.GetUserSolution(Int32.Parse(text[1]), user.StudentId).Result;
            /*var task = _coursesServiceClient.GetTask(Int32.Parse(text[1])).Result;
            var hw = _coursesServiceClient.GetHomework(task.HomeworkId).Result;*/
            
            var rows = new List<InlineKeyboardButton[]>();
            var cols = new List<InlineKeyboardButton>();
            for (var i = 1; i < solutions.Length + 1; i++)
            {
                var k = GetButton($"Попытка {i}", $"/solutioninfo {solutions[i - 1].Id}");
                cols.Add(k);
                if (i % 3 != 0) continue;
                rows.Add(cols.ToArray());
                cols = new List<InlineKeyboardButton>();
            }

            if (solutions.Length < 3)
            {
                rows.Add(cols.ToArray());
            }
            var button = GetButton("Мои курсы", $"/courses");
            cols.Add(button);
            /*button = GetButton("Мои домашки", $"/homeworks {hw.CourseId}");
            cols.Add(button);*/
            rows.Add(cols.ToArray());
            cols = new List<InlineKeyboardButton>();
            /*button = GetButton("Мои задачи", $"/task {task.HomeworkId}");
            cols.Add(button);*/
            rows.Add(cols.ToArray());
            
            var keyboardMarkup = new InlineKeyboardMarkup(rows.ToArray());

            await _botClient.SendTextMessageAsync(user.ChatId, "", ParseMode.Markdown, replyMarkup:keyboardMarkup);
        }
        
        private InlineKeyboardButton GetButton(string text, string callbackData)
            => new InlineKeyboardButton
            { 
                Text = text,
                CallbackData = callbackData
            };
    }
}