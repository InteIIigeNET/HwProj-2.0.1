using System;
using System.Linq;
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
    public class GetStatistics: Commands
    {
        private readonly TelegramBotClient _botClient;
        private readonly IUserService _userService;
        private readonly ISolutionsServiceClient _solutionsServiceClient;
        private readonly ICoursesServiceClient _coursesServiceClient;

        public GetStatistics(TelegramBot telegramBot, IUserService userService, ICoursesServiceClient coursesServiceClient, ISolutionsServiceClient solutionsServiceClient)
        {
            _botClient = telegramBot.GetBot().Result;
            _userService = userService;
            _coursesServiceClient = coursesServiceClient;
            _solutionsServiceClient = solutionsServiceClient;
        }

        public override string Name => CommandNames.GetStatistics;
        
        public override async Task ExecuteAsync(Update update)
        {
            var user = await _userService.GetOrCreateChatId(update);
            var message = update.CallbackQuery.Data;
            var text = message.Split(' ');
            var course = _coursesServiceClient.GetCourseById(Int64.Parse(text[1]), user.AccountId).Result;
            var statistics = _solutionsServiceClient.GetCourseStatistics(course.Id, course.MentorIds.Split("/")[0]).Result;
            var statistic = statistics.First(cm => cm.Id == user.AccountId);
            int maxRating = 0;
            int? studentRating = 0;
            foreach (var hw in statistic.Homeworks)
            {
                foreach (var task in hw.Tasks)
                {
                    studentRating += task.Solution.Max(cm => cm.Rating);
                }
            }

            var hwModel = _coursesServiceClient.GetAllHomeworkByCourse(course.Id).Result;
            foreach (var hw in hwModel)
            {
                maxRating += hw.Tasks.Max(cm => cm.MaxRating);
            }

            if (studentRating == null)
            {
                studentRating = 0;
            }
            
            var inlineKeyboard = new InlineKeyboardMarkup(GetButton("Мои курсы", "/courses"));

            await _botClient.SendTextMessageAsync(user.ChatId, 
                $"<b>Курс:</b> {course.Name}." +
                $"\n<b>Баллы:</b> {studentRating}/{maxRating}",
                parseMode: ParseMode.Html,
                replyMarkup:inlineKeyboard);
        }
    }
}