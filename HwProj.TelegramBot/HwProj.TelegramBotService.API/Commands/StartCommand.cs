using System.Threading.Tasks;
using HwProj.TelegramBotService.API.Service;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;

namespace HwProj.TelegramBotService.API.Commands
{
    public class StartCommand : Commands
    {
        private readonly TelegramBotClient _botClient;
        private readonly IUserTelegramService _userTelegramService;

        public StartCommand(TelegramBot telegramBot, IUserTelegramService userTelegramService)
        {
            _botClient = telegramBot.GetBot().Result;
            _userTelegramService = userTelegramService;
        }

        public override string Name => CommandNames.StartCommand;
        
        public override async Task ExecuteAsync(Update update)
        {
            await _userTelegramService.DeleteUser(update);
            
            var user = await _userTelegramService.CreateUser(update.Message.Chat.Id);

            await _botClient.SendTextMessageAsync(user.ChatId, "Добро пожаловать!\nВведите ваш e-mail на Hw-Proj2.0.1",
                ParseMode.Markdown);
        }
    }
}