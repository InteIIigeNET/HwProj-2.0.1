using System.Threading.Tasks;
using HwProj.TelegramBotAPI.Service;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;
using Telegram.Bot.Types.ReplyMarkups;

namespace HwProj.TelegramBotAPI.Commands
{
    public class StartCommand : Commands
    {
        private readonly TelegramBotClient _botClient;
        private readonly IUserService _userService;

        public StartCommand(TelegramBot telegramBot, IUserService userService)
        {
            _botClient = telegramBot.GetBot().Result;
            _userService = userService;
        }

        public override string Name => CommandNames.StartCommand;
        
        public override async Task ExecuteAsync(Update update)
        {
            var user = await _userService.GetOrCreateChatId(update);

            var inlineKeyboard = new InlineKeyboardMarkup(new InlineKeyboardButton
            {
                Text = "Мои курсы",
                CallbackData = "/courses"
            });

            await _botClient.SendTextMessageAsync(user.ChatId, "Добро пожаловать!", ParseMode.Markdown, replyMarkup:inlineKeyboard);
        }
    }
}