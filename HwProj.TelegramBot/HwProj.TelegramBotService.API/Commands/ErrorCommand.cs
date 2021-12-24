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
        private readonly IUserService _userService;

        public ErrorCommand(TelegramBot telegramBot, IUserService userService)
        {
            _botClient = telegramBot.GetBot().Result;
            _userService = userService;
        }

        public override string Name => CommandNames.ErrorCommand;
        
        public override async Task ExecuteAsync(Update update)
        {
            var user = await _userService.UserByUpdate(update);

            await _botClient.SendTextMessageAsync(user.ChatId, "Повторите ещё раз!", ParseMode.Markdown);
        }
    }
}