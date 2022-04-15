using System;
using System.Threading.Tasks;
using HwProj.Models.TelegramBotService;
using HwProj.SolutionsService.Client;
using HwProj.TelegramBotService.API.Service;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;

namespace HwProj.TelegramBotService.API.Commands
{
    public class WaitPullRequest : Commands
    {
        private readonly TelegramBotClient _botClient;
        private readonly IUserService _userService;

        public WaitPullRequest(TelegramBot telegramBot, IUserService userService)
        {
            _botClient = telegramBot.GetBot().Result;
            _userService = userService;
        }

        public override string Name => CommandNames.WaitPullRequest;
        
        public override async Task ExecuteAsync(Update update)
        {
            var message = update.CallbackQuery.Data;
            var text = message.Split(' ');

            var user = await _userService.AddTaskIdAndWaitPullRequest(update, Int64.Parse(text[1]));

            await _botClient.SendTextMessageAsync(user.ChatId, "Отправьте ссылку на pull request.",
                ParseMode.Markdown);
        }
    }
}