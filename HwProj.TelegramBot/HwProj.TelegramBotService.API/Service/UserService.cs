using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.Models.AuthService.DTO;
using HwProj.TelegramBotService.API.Models;
using Microsoft.EntityFrameworkCore;
using Telegram.Bot.Types;

namespace HwProj.TelegramBotService.API.Service
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
            AccountDataDto studentModel = null;
            TelegramUserModel newUser;
            if (update.CallbackQuery == null)
            {
                var message = update.Message?.Text;
                var text = message.Split(' ');
                if (text[0] == "/start" && text.Length > 1)
                {
                    studentId = _authClient.FindByEmailAsync(text[1]).Result;
                    studentModel = _authClient.GetAccountData(studentId).Result;
                }
                else
                {
                    return await _context.TelegramUser.FirstOrDefaultAsync(x => x.ChatId == update.Message.Chat.Id);
                }
                
                newUser = new TelegramUserModel
                {
                    Id = update.Message.Chat.Id,
                    ChatId = update.Message.Chat.Id,
                    AccountId = studentId,
                    IsLecture = studentModel.Role == "Lecture",
                    IsRegistered = true
                };
            }
            else
            {
                var message = update.CallbackQuery.Data;
                var text = message.Split(' ');
                studentId = _context.TelegramUser.FirstOrDefaultAsync(x => x.ChatId == update.CallbackQuery.Message.Chat.Id).Result.AccountId;
                studentModel = _authClient.GetAccountData(studentId).Result;
                
                newUser = new TelegramUserModel
                {
                    Id = update.CallbackQuery.Message.Chat.Id,
                    ChatId = update.CallbackQuery.Message.Chat.Id,
                    AccountId = studentId,
                    IsLecture = studentModel.Role == "Lecture",
                    IsRegistered = true
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

        /*public async Task<TelegramUserModel> CreateChatId(Update update)
        {
            string studentId;
            AccountDataDto studentModel = null;
            TelegramUserModel newUser;
            if (update.CallbackQuery == null)
            {
                newUser = new TelegramUserModel
                {
                    Id = update.Message.Chat.Id,
                    ChatId = update.Message.Chat.Id,
                    AccountId = studentId,
                    IsLecture = studentModel.Role == "Lecture",
                    IsRegistered = true
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
        }*/

        
        public async Task<TelegramUserModel> GetTelegramUserModelByStudentId(string studentId)
            => _context.TelegramUser.FirstOrDefaultAsync(x => x.AccountId == studentId).Result;
        
        public async Task<TelegramUserModel> GetTelegramUserModelByChatId(long ChatId)
            => _context.TelegramUser.FirstOrDefaultAsync(x => x.ChatId == ChatId).Result;
    }
}