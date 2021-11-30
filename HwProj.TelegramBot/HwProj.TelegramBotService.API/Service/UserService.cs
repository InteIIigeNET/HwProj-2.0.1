using System;
using System.Linq;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.AuthService.DTO;
using HwProj.TelegramBotService.API.Events;
using HwProj.TelegramBotService.API.Models;
using Microsoft.EntityFrameworkCore;
using Telegram.Bot.Types;

namespace HwProj.TelegramBotService.API.Service
{
    public class UserService : IUserService
    {
        private readonly TelegramBotContext _context;
        private readonly IAuthServiceClient _authClient;
        private readonly IEventBus _eventBus;

        public UserService(TelegramBotContext context, IAuthServiceClient authClient, IEventBus eventBus)
        {
            _context = context;
            _authClient = authClient;
            _eventBus = eventBus;
        }
        
        public async Task<TelegramUserModel> CreateUser(Update update)
        {
            /*var user = await _context.TelegramUser.FirstOrDefaultAsync(x => x.ChatId == update.Message.Chat.Id);
            _context.Remove(user);
            await _context.SaveChangesAsync();*/
            var random = new Random();
            var code = random.Next(10) * 1000 + random.Next(10) * 100 + random.Next(10) * 10 + random.Next(10);
            var newUser = new TelegramUserModel
            {
                Id = update.Message.Chat.Id,
                ChatId = update.Message.Chat.Id,
                AccountId = null,
                IsLecture = false,
                IsRegistered = false,
                Code = code.ToString(),
                Operation = "wait_code"
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
        
        public async Task<TelegramUserModel> AddEmailToUser(Update update)
        {
            var message = update.Message?.Text;
            var user =  await _context.TelegramUser.FindAsync(update.Message.Chat.Id);
            if (user.Operation != "wait_code" || user == null)
            { 
                _context.Remove(user);
                await _context.SaveChangesAsync();
                return null;
            }
            var accountId = _authClient.FindByEmailAsync(message).Result;
            var studentModel = _authClient.GetAccountData(accountId).Result;
            user.Operation = "check_code";
            user.AccountId = accountId;
            user.IsLecture = studentModel.Role == "Lecture";
            await _context.SaveChangesAsync();
            _eventBus.Publish(new ConfirmTelegramBotEvent(user));
            return user;
        }

        public async Task<TelegramUserModel> AddFinishUser(Update update)
        {
            var message = update.Message?.Text;
            var user =  await _context.TelegramUser.FindAsync(update.Message.Chat.Id);
            if (user.Operation != "check_code" || user.Code != message || user == null)
            { 
                _context.Remove(user);
                await _context.SaveChangesAsync();
                return null;
            }
            user.Operation = "finish";
            user.IsRegistered = true;
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<TelegramUserModel> GetUserByUpdate(Update update)
            => await _context.TelegramUser.FindAsync(update.CallbackQuery == null ? update.Message.Chat.Id : update.CallbackQuery.Message.Chat.Id);

        public async Task<TelegramUserModel> GetTelegramUserModelByStudentId(string studentId)
            => _context.TelegramUser.First(x => x.AccountId == studentId);
        
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
        
        public async Task<TelegramUserModel> GetTelegramUserModelByChatId(long chatId)
            => _context.TelegramUser.FindAsync(chatId).Result;
    }
}