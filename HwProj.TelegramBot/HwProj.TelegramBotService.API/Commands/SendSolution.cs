using System;
using System.Threading.Tasks;
using HwProj.Models.SolutionsService;
using HwProj.SolutionsService.Client;
using HwProj.TelegramBotService.API.Service;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;

namespace HwProj.TelegramBotService.API.Commands
{
    public class SendSolution: Commands
    {
        private readonly TelegramBotClient _botClient;
        private readonly IUserService _userService;
        private readonly ISolutionsServiceClient _solutionsService;

        public SendSolution(TelegramBot telegramBot, IUserService userService, ISolutionsServiceClient solutionsService)
        {
            _botClient = telegramBot.GetBot().Result;
            _userService = userService;
            _solutionsService = solutionsService;
        }

        public override string Name => CommandNames.SendSolution;
        
        public override async Task ExecuteAsync(Update update)
        {
            var user = await _userService.UserByUpdate(update);
            var message = update.Message.Text;

            var solutionModel = new SolutionViewModel
            {
                GithubUrl = message,
                Comment = "",
                StudentId = user.AccountId,
                PublicationDate = DateTime.Now,
                LecturerComment = ""
            };

            await _solutionsService.PostSolution(solutionModel, Convert.ToInt64(user.TaskIdToSend));
            
            await _botClient.SendTextMessageAsync(user.ChatId, "Решение отправлено.",
                ParseMode.Markdown);
        }
    }
}