using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.TelegramBotService;
using HwProj.TelegramBotService.API.Events;
using HwProj.TelegramBotService.API.Models;
using HwProj.TelegramBotService.API.Repositories;
using Microsoft.EntityFrameworkCore;
using Telegram.Bot.Types;

namespace HwProj.TelegramBotService.API.Service
{
    public class UserService : IUserService
    {
        private readonly ITelegramBotRepository _telegramBotRepository;
        private readonly TelegramBotContext _context;
        private readonly IAuthServiceClient _authClient;
        private readonly IEventBus _eventBus;

        public UserService(TelegramBotContext context, IAuthServiceClient authClient, IEventBus eventBus, ITelegramBotRepository telegramBotRepository, IMapper mapper)
        {
            _context = context;
            _authClient = authClient;
            _eventBus = eventBus;
            _telegramBotRepository = telegramBotRepository;
        }
        
        public async Task<UserTelegram> CreateUser(Update update)
        {
            var random = new Random();
            var chars = "ABCEFGHJKPQRSTXYZ0123456789";
            var code = new StringBuilder();
            code.Append(chars[random.Next(chars.Length)]);
            code.Append(chars[random.Next(chars.Length)]);
            code.Append(chars[random.Next(chars.Length)]);
            code.Append(chars[random.Next(chars.Length)]);
            code.Append(chars[random.Next(chars.Length)]);
            code.Append(chars[random.Next(chars.Length)]);
            var newUser = new UserTelegram
            {
                ChatId = update.Message.Chat.Id,
                AccountId = null,
                IsLecture = false,
                IsRegistered = false,
                Code = code.ToString(),
                Operation = "wait_code",
            };
            var user = await _context.TelegramUser.FirstOrDefaultAsync(x => x.ChatId == newUser.ChatId);
        
            if (user != null)
            {
                return user;
            }
    
            var result = await _context.TelegramUser.AddAsync(newUser);
            await _context.SaveChangesAsync();
    
            return result.Entity;
        }
        
        public async Task<UserTelegram> AddEmailToUser(Update update)
        {
            var message = update.Message?.Text;
            var user = _telegramBotRepository.GetUserTelegramByChatId(update.Message.Chat.Id);
            var userModel = user.ToArray()[0];
            if (userModel.Operation != "wait_code" || user == null)
            { 
                _context.Remove(userModel);
                await _context.SaveChangesAsync();
                return null;
            }
            var accountId = _authClient.FindByEmailAsync(message).Result;
            var studentModel = _authClient.GetAccountData(accountId).Result;
            userModel.Operation = "check_code";
            userModel.AccountId = accountId;
            userModel.IsLecture = studentModel.Role == "Lecture";
            await _context.SaveChangesAsync();
            _eventBus.Publish(new ConfirmTelegramBotEvent(userModel.AccountId, userModel.Code));
            return userModel;
        }

        public async Task<UserTelegram> AddFinishUser(Update update)
        {
            var message = update.Message?.Text;
            var user = _telegramBotRepository.GetUserTelegramByChatId(update.Message.Chat.Id);
            var userModel = user.ToArray()[0];
            if (userModel.Operation != "check_code" || userModel.Code != message || user == null)
            { 
                _context.Remove(user);
                await _context.SaveChangesAsync();
                return null;
            }
            userModel.Operation = "finish";
            userModel.IsRegistered = true;
            await _context.SaveChangesAsync();
            return userModel;
        }

        public async Task<UserTelegram> UserByUpdate(Update update)
            => update.Message == null
                ? _context.TelegramUser.FirstOrDefaultAsync(x => x.ChatId == update.CallbackQuery.Message.Chat.Id).Result
                : _context.TelegramUser.FirstOrDefaultAsync(x => x.ChatId == update.Message.Chat.Id).Result;

        public async Task<UserTelegram> TelegramUserModelByStudentId(string studentId)
            => _context.TelegramUser.First(x => x.AccountId == studentId);
        
        // not write metod
        /*public async Task<UserTelegram> AddTaskIdToSentSolution(long chatId, long taskId)
        {
            var user = await _context.TelegramUser.FindAsync(chatId);
            /*user.TaskId = taskId;#1#
            await _context.SaveChangesAsync();
            return user;
        }*/
        
        public async Task DeleteUser(Update update)
        {
            var user1 = await _context.TelegramUser.FindAsync(update.Message.Chat.Id);
            if (user1 != null)
            {
                var user = await _context.TelegramUser.FirstOrDefaultAsync(x => x.ChatId == update.Message.Chat.Id);
                _context.Remove(user);
                await _context.SaveChangesAsync();    
            }
        }
    }
}