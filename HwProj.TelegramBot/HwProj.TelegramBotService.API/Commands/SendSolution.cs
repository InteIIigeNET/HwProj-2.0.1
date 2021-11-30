using System.Threading.Tasks;
using HwProj.SolutionsService.Client;
using HwProj.TelegramBotService.API.Service;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;

namespace HwProj.TelegramBotService.API.Commands
{
    public class SendSolution : Commands
    {
        private readonly TelegramBotClient _botClient;
        private readonly IUserService _userService;
        private readonly ISolutionsServiceClient _solutionsServiceClient;

        public SendSolution(TelegramBot telegramBot, IUserService userService,
            ISolutionsServiceClient solutionsServiceClient)
        {
            _botClient = telegramBot.GetBot().Result;
            _userService = userService;
            _solutionsServiceClient = solutionsServiceClient;
        }

        public override string Name => CommandNames.SendSolution;

        public override async Task ExecuteAsync(Update update)
        {
            var user = await _userService.GetUserByUpdate(update);

            /*await _solutionsServiceClient.PostSolution();*/
            
            await _botClient.SendTextMessageAsync(user.ChatId, "Добро пожаловать!",
                ParseMode.Markdown /*, replyMarkup:inlineKeyboard*/);
        }
    }
}