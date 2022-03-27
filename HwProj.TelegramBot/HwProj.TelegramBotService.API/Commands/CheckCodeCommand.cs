using System.Threading.Tasks;
using HwProj.TelegramBotService.API.Service;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;
using Telegram.Bot.Types.ReplyMarkups;

namespace HwProj.TelegramBotService.API.Commands
{
    public class CheckCodeCommand : Commands
    {
        private readonly TelegramBotClient _botClient;
        private readonly IUserService _userService;

        public CheckCodeCommand(TelegramBot telegramBot, IUserService userService)
        {
            _botClient = telegramBot.GetBot().Result;
            _userService = userService;
        }

        public override string Name => CommandNames.CheckCodeCommand;
        
        public override async Task ExecuteAsync(Update update)
        {
            var user = await _userService.AddFinishUser(update);
            
            var inlineKeyboard = new InlineKeyboardMarkup(GetButton("Мои курсы", "/courses"));

            await _botClient.SendTextMessageAsync(user.ChatId, "Добро пожаловать в Hw-ProjBot!", replyMarkup: inlineKeyboard);
        }
    }
}