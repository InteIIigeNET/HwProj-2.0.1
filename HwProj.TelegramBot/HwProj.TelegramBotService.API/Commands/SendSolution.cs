using System.Collections.Generic;
using System.Threading.Tasks;
using HwProj.CoursesService.Client;
using HwProj.SolutionsService.API.Services;
using HwProj.SolutionsService.Client;
using HwProj.TelegramBotService.API.Service;
using Microsoft.AspNetCore.Builder;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;
using Telegram.Bot.Types.ReplyMarkups;

namespace HwProj.TelegramBotService.API.Commands
{
    public class SendSolution : Commands
    {
        private readonly TelegramBotClient _botClient;
        private readonly IUserService _userService;
        private readonly ISolutionsService _solutionsServiceClient;
        private readonly ICoursesServiceClient _coursesServiceClient;

        public SendSolution(TelegramBot telegramBot, IUserService userService,
            ISolutionsService solutionsServiceClient, ICoursesServiceClient coursesServiceClient)
        {
            _botClient = telegramBot.GetBot().Result;
            _userService = userService;
            _solutionsServiceClient = solutionsServiceClient;
            _coursesServiceClient = coursesServiceClient;
        }

        public override string Name => CommandNames.SendSolution;

        public override async Task ExecuteAsync(Update update)
        {
            var user = await _userService.UserByUpdate(update);
            /*if (user.TaskId == -1)
            {
                await _botClient.SendTextMessageAsync(user.ChatAspNetUsersId, "Попробуйте ещё раз.",
                    ParseMode.Markdown);
                return;
            }*/

            var message = update.CallbackQuery.Data;
            
            var pullRequested = message.Split(' ')[0];
            var comment =  message.Split(' ')[1];
            /*await _solutionsServiceClient.PostFromTelegramAsync(user.TaskId, pullRequested, comment, user.AccountId);
            var task = _coursesServiceClient.GetTask(user.TaskId).Result;
            var hw = _coursesServiceClient.GetHomework(task.HomeworkId).Result;
            
            var rows = new List<InlineKeyboardButton[]>();
            var cols = new List<InlineKeyboardButton>();
            cols.Add(GetButton($"Решения {task.Title}", $"/solutions {task.Id}"));
            rows.Add(cols.ToArray());
            cols = new List<InlineKeyboardButton>();
            cols.Add(GetButton($"Отправить решение {task.Title}", $"/wait_solution {task.Id}"));
            rows.Add(cols.ToArray());
            cols = new List<InlineKeyboardButton>();
            cols.Add(GetButton("Мои курсы",  $"/courses"));
            cols.Add(GetButton("Мои домашки", $"/homeworks {hw.CourseId}"));
            cols.Add(GetButton("Мои задачи", $"/task {task.HomeworkId}"));
            rows.Add(cols.ToArray());
            
            var keyboardMarkup = new InlineKeyboardMarkup(rows.ToArray());*/

            await _botClient.SendTextMessageAsync(user.ChatId, "Ваша задача отправлена.",
                ParseMode.Markdown/*, replyMarkup:keyboardMarkup*/);
        }
    }
}