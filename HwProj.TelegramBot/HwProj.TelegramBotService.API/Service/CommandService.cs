using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HwProj.TelegramBotService.API.Commands;
using HwProj.TelegramBotService.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;

namespace HwProj.TelegramBotService.API.Service
{
    public class CommandService : ICommandService
    {
        private readonly TelegramBotContext _context;
        private readonly List<Commands.Commands> _commands;
        private Commands.Commands _lastCommand;

        public CommandService(IServiceProvider serviceProvider, TelegramBotContext context)
        {
            _context = context;
            _commands = serviceProvider.GetServices<Commands.Commands>().ToList();
        }
        
        public async Task Execute(Update update)
        {
            if(update?.Message?.Chat == null && update?.CallbackQuery == null)
                return;
            
            if (update.Type == UpdateType.Message)
            {
                var message = update.Message?.Text;
                switch (message)
                {
                    case "/start":
                        await ExecuteCommand(CommandNames.StartCommand, update);
                        return;
                    case "/courses":
                        await ExecuteCommand(CommandNames.GetCourses, update);
                        return;
                }
                var user = _context.TelegramUser.FirstOrDefaultAsync(x => x.ChatId == update.Message.Chat.Id).Result;
                if (user.Operation == "wait_code" || user.Operation == "check_code")
                {
                    switch (user.Operation)
                    {
                        case "wait_code":
                            await ExecuteCommand(CommandNames.WaitCodeCommand, update);
                            break;
                        case "check_code":
                            await ExecuteCommand(CommandNames.CheckCodeCommand, update);
                            break;
                    }
                }
                if (user == null)
                {
                    await ExecuteCommand(CommandNames.StartCommand, update);
                }
                if (user.Operation == null)
                {
                    
                }
            }
            else
            {
                switch (update.CallbackQuery.Data.Split(' ')[0])
                {
                    case "/courses":
                        await ExecuteCommand(CommandNames.GetCourses, update);
                    break;
                    case "/homeworks":
                        await ExecuteCommand(CommandNames.GetHomeworks, update);
                    break;
                    case "/statistics":
                        await ExecuteCommand(CommandNames.GetStatistics, update);
                    break;
                    case "/task":
                        await ExecuteCommand(CommandNames.GetTasks, update);
                    break;
                    case "/taskinfo":
                        await ExecuteCommand(CommandNames.GetTaskInfo, update);
                    break;
                    case "/solutions":
                        await ExecuteCommand(CommandNames.GetSolutionsFromTask, update);
                    break;
                    case "/solutioninfo":
                        await ExecuteCommand(CommandNames.GetSolutionInfo, update);
                    break;
                }
            }
            
        }
        
        private async Task ExecuteCommand(string commandName, Update update)
        {
            _lastCommand = _commands.First(x=> x.Name == commandName);
            await _lastCommand.ExecuteAsync(update);
        }
    }
}