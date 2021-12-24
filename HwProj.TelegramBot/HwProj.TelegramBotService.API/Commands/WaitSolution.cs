using System;
using System.Threading.Tasks;
using HwProj.SolutionsService.Client;
using HwProj.TelegramBotService.API.Service;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;

namespace HwProj.TelegramBotService.API.Commands
{
    public class WaitSolution: Commands
    {
        private readonly TelegramBotClient _botClient;
        private readonly IUserService _userService;
        private readonly ISolutionsServiceClient _solutionsServiceClient;

        public WaitSolution(TelegramBot telegramBot, IUserService userService,
            ISolutionsServiceClient solutionsServiceClient)
        {
            _botClient = telegramBot.GetBot().Result;
            _userService = userService;
            _solutionsServiceClient = solutionsServiceClient;
        }

        public override string Name => CommandNames. WaitSolution;

        public override async Task ExecuteAsync(Update update)
        {
            var user = await _userService.UserByUpdate(update);
            var message = update.CallbackQuery.Data;
            var taskId = int.Parse(message.Split(' ')[1]);

            user = await _userService.AddTaskIdToSentSolution(update.CallbackQuery.Message.Chat.Id, taskId);

            await _botClient.SendTextMessageAsync(user.ChatId, "Введите ссылку на pull request и комментарий. " +
                                                               "\n Пример: '<ccылка на pull request> <комментарий'",
                ParseMode.Markdown);
        }
    }
}