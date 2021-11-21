using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;

namespace HwProj.TelegramBotAPI.Service
{
    public class CommandService : ICommandService
    {
        private readonly List<Commands.Commands> _commands;
        private Commands.Commands _lastCommand;

        public CommandService(IServiceProvider serviceProvider)
        {
            _commands = serviceProvider.GetServices<Commands.Commands>().ToList();
        }
        
        public async Task Execute(Update update)
        {
            if(update?.Message?.Chat == null && update?.CallbackQuery == null)
                return;

            if (update.Type == UpdateType.Message)
            {
                var message = update.Message?.Text;
                var text = message.Split(' ');

                if (text[0] == "/start" && text.Length > 1)
                {
                    await ExecuteCommand(CommandNames.StartCommand, update);
                    return;
                }
                switch (text[0])
                {
                    case "/start":
                        await ExecuteCommand(CommandNames.StartCommand, update);
                        break;
                    case "/courses":
                        await ExecuteCommand(CommandNames.GetCourses, update);
                        break;
                    case "/homeworks":
                        await ExecuteCommand(CommandNames.GetHomeworks, update);
                        break;
                }
            }
            switch (update.CallbackQuery.Data.Split(' ')[0])
            {
                case "/homeworks":
                    await ExecuteCommand(CommandNames.GetHomeworks, update);
                    break;
            }
        }
        
        private async Task ExecuteCommand(string commandName, Update update)
        {
            _lastCommand = _commands.First(x=> x.Name == commandName);
            await _lastCommand.ExecuteAsync(update);
        }
    }
}