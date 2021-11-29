using System.Threading.Tasks;
using HwProj.CoursesService.Client;
using HwProj.TelegramBotService.API.Service;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;
using Telegram.Bot.Types.ReplyMarkups;

namespace HwProj.TelegramBotService.API.Commands
{
    public class GetAllCourses : Commands
    {
        private readonly TelegramBotClient _botClient;
        private readonly IUserService _userService;
        private readonly ICoursesServiceClient _coursesServiceClient;

        public GetAllCourses(TelegramBot telegramBot, IUserService userService, ICoursesServiceClient coursesServiceClient)
        {
            _botClient = telegramBot.GetBot().Result;
            _userService = userService;
            _coursesServiceClient = coursesServiceClient;
        }

        public override string Name => CommandNames.GetAllCourses;
        
        public override async Task ExecuteAsync(Update update)
        {
            var user = await _userService.GetOrCreateChatId(update);

            var courses = _coursesServiceClient.GetAllCourses().Result;

            await _botClient.SendTextMessageAsync(user.ChatId, "Добро пожаловать!", ParseMode.Markdown/*, replyMarkup:inlineKeyboard*/);
        }
    }
}