using System;
using System.Threading.Tasks;
using HwProj.TelegramBotService.API.Service;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;

namespace HwProj.TelegramBotService.API.Commands
{
    public class SaveUrlAndWaitComment : Commands
    {
        private readonly TelegramBotClient _botClient;
        private readonly IUserService _userService;

        public SaveUrlAndWaitComment(TelegramBot telegramBot, IUserService userService)
        {
            _botClient = telegramBot.GetBot().Result;
            _userService = userService;
        }

        public override string Name => CommandNames.SaveUrlAndWaitComment;
        
        public override async Task ExecuteAsync(Update update)
        {
            var message = update.Message.Text;
            

            var user = await _userService.AddGitHubUrlToTask(update, message);

            await _botClient.SendTextMessageAsync(user.ChatId, "Добавьте комментарий к решению.",
                ParseMode.Markdown);
        }
    }
}