using System;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.TelegramBotAPI.Models;
using Microsoft.EntityFrameworkCore;
using Telegram.Bot.Types;

namespace HwProj.TelegramBotAPI.Service
{
    public class UserService : IUserService
    {
        private readonly TelegramBotContext _context;
        private readonly IAuthServiceClient _authClient;

        public UserService(TelegramBotContext context, IAuthServiceClient authClient)
        {
            _context = context;
            _authClient = authClient;
        }

        public async Task<TelegramUserModel> GetOrCreateChatId(Update update)
        {
            string studentId;
            TelegramUserModel newUser;
            if (update.CallbackQuery == null)
            {
                var message = update.Message?.Text;
                var text = message.Split(' ');
                if (text[0] == "/start" && text.Length > 1)
                {
                    studentId= _authClient.FindByEmailAsync(text[1]).Result;
                }
                else
                {
                    studentId = _context.TelegramUser.FirstOrDefaultAsync(x => x.ChatId == update.Message.Chat.Id).Result.StudentId;
                }
                
                newUser = new TelegramUserModel
                {
                    Id = update.Message.Chat.Id,
                    StudentId = studentId,
                    ChatId = update.Message.Chat.Id,
                    IsRegister = true
                };
            }
            else
            {
                var message = update.CallbackQuery.Data;
                var text = message.Split(' ');
                studentId = _context.TelegramUser.FirstOrDefaultAsync(x => x.ChatId == update.CallbackQuery.Message.Chat.Id).Result.StudentId;

                newUser = new TelegramUserModel
                {
                    Id = update.CallbackQuery.Message.Chat.Id,
                    StudentId = studentId,
                    ChatId = update.CallbackQuery.Message.Chat.Id,
                    IsRegister = true
                };
            }
            var user = await _context.TelegramUser.FirstOrDefaultAsync(x => x.ChatId == newUser.ChatId);
    
            if (user != null)
            {
                return user;
            }
    
            var result = await _context.TelegramUser.AddAsync(newUser);
            await _context.SaveChangesAsync();
    
            return result.Entity;
        }
    }
}