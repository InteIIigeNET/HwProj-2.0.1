using System.Threading.Tasks;
using HwProj.TelegramBotService.API.Service;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;

namespace HwProj.TelegramBotService.API.Commands
{
    public class ErrorCommand : Commands
    {
        private readonly TelegramBotClient _botClient;
        private readonly IUserTelegramService _userTelegramService;

        public ErrorCommand(TelegramBot telegramBot, IUserTelegramService userTelegramService)
        {
            _botClient = telegramBot.GetBot().Result;
            _userTelegramService = userTelegramService;
        }

        public override string Name => CommandNames.ErrorCommand;
        
        public override async Task ExecuteAsync(Update update)
        {
            var user = await _userTelegramService.UserByUpdate(update);

            await _botClient.SendTextMessageAsync(user.ChatId, "Повторите ещё раз!", ParseMode.Markdown);
        }
    }
}