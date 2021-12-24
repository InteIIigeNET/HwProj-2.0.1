using System.Threading.Tasks;
using HwProj.TelegramBotService.API.Service;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;

namespace HwProj.TelegramBotService.API.Commands
{
    public class WaitCodeCommand : Commands
    {
        private readonly TelegramBotClient _botClient;
        private readonly IUserService _userService;

        public WaitCodeCommand(TelegramBot telegramBot, IUserService userService)
        {
            _botClient = telegramBot.GetBot().Result;
            _userService = userService;
        }

        public override string Name => CommandNames.WaitCodeCommand;
        
        public override async Task ExecuteAsync(Update update)
        {
            var user = await _userService.AddEmailToUser(update);

            if (user == null)
            {
                await _botClient.SendTextMessageAsync(update.Message.Chat.Id, "E-mail не зарегистрирован на Hw-Proj2.0.1." +
                                                                              "\nВведите /start", ParseMode.Markdown);
            }

            await _botClient.SendTextMessageAsync(user.ChatId, "Ваш код отправлен.\nВведите его:", ParseMode.Markdown);
        }
    }
}