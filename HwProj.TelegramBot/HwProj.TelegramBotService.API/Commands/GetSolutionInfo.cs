using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HwProj.CoursesService.Client;
using HwProj.SolutionsService.Client;
using HwProj.TelegramBotService.API.Service;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;
using Telegram.Bot.Types.ReplyMarkups;

namespace HwProj.TelegramBotService.API.Commands
{
    public class GetSolutionInfo : Commands
    {
        private readonly ISolutionsServiceClient _solutionsServiceClient;
        private readonly ICoursesServiceClient _coursesServiceClient;
        private readonly TelegramBotClient _botClient;
        private readonly IUserService _userService;

        public GetSolutionInfo(TelegramBot telegramBot, ISolutionsServiceClient solutionsServiceClient,
            IUserService userService, ICoursesServiceClient coursesServiceClient)
        {
            _botClient = telegramBot.GetBot().Result;
            _solutionsServiceClient = solutionsServiceClient;
            _userService = userService;
            _coursesServiceClient = coursesServiceClient;
        }
        
        public override string Name => CommandNames.GetSolutionInfo; 
        
        public override async Task ExecuteAsync(Update update)
        {
            var user = await _userService.GetUserByUpdate(update);
            var message = update.CallbackQuery.Data;
            var text = message.Split(' ');
            var solution =_solutionsServiceClient.GetSolutionById(Int32.Parse(text[1])).Result;
            var task = _coursesServiceClient.GetTask(solution.TaskId).Result;
            var hw = _coursesServiceClient.GetHomework(task.HomeworkId).Result;

            var rows = new List<InlineKeyboardButton[]>();
            var cols = new List<InlineKeyboardButton>();
            
            cols.Add(GetButton($"Решения {task.Title}", $"/solutions {task.Id}"));
            cols.Add(GetButton("Мои курсы",  $"/courses"));
            rows.Add(cols.ToArray());
            cols = new List<InlineKeyboardButton>();
            cols.Add(GetButton("Мои домашки", $"/homeworks {hw.CourseId}"));
            cols.Add(GetButton("Мои задачи", $"/task {task.HomeworkId}"));
            rows.Add(cols.ToArray());
            cols = new List<InlineKeyboardButton>();
            cols.Add(new InlineKeyboardButton {Text = "Github", Url = solution.GithubUrl});
            rows.Add(cols.ToArray());
            
            var keyboardMarkup = new InlineKeyboardMarkup(rows.ToArray());
            
            await _botClient.SendTextMessageAsync(user.ChatId, 
                $"<b>Отзыв преподователя:</b> {solution.LecturerComment}." +
                $"\n<b>Оценка:</b> {solution.Rating}/{task.MaxRating}.",
                parseMode: ParseMode.Html,
                replyMarkup:keyboardMarkup);
        }
    }
}