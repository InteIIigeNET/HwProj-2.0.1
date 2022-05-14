﻿using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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
        private readonly IAuthServiceClient _authClient;
        private readonly IEventBus _eventBus;

        public UserService(IAuthServiceClient authClient, IEventBus eventBus, ITelegramBotRepository telegramBotRepository)
        {
            _authClient = authClient;
            _eventBus = eventBus;
            _telegramBotRepository = telegramBotRepository;
        }

        public async Task<UserTelegram> CreateUser(long chatId)
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
                ChatId = chatId,
                AccountId = null!,
                IsLecture = false,
                IsRegistered = false,
                Code = code.ToString(),
                Operation = "wait_code",
            };
            var user = await _telegramBotRepository.AddAsync(newUser);
            return await _telegramBotRepository.FindAsync(x => x.Id == user);
        }

        public async Task<UserTelegram> AddEmailToUser(long chatId, string message)
        {
            var user = _telegramBotRepository.GetUserTelegramByChatId(chatId);
            var userModel = user.ToArray()[0];
            if (userModel.Operation != "wait_code" || user == null)
            {
                await _telegramBotRepository.DeleteAsync(userModel.Id);
                return null;
            }

            var accountId = await _authClient.FindByEmailAsync(message);
            var studentModel = await _authClient.GetAccountData(accountId);
            userModel.Operation = "check_code";
            userModel.AccountId = accountId;
            userModel.IsLecture = studentModel.Role == "Lecture";
            var newUserModel = new UserTelegram
            {
                ChatId = userModel.ChatId,
                AccountId = accountId,
                IsLecture = userModel.IsLecture,
                IsRegistered = false,
                Code = userModel.Code,
                Operation = "check_code",
            };
            await _telegramBotRepository.UpdateAsync(userModel.Id, x => new UserTelegram
            {
                ChatId = userModel.ChatId,
                AccountId = accountId,
                IsLecture = userModel.IsLecture,
                IsRegistered = false,
                Code = userModel.Code,
                Operation = "check_code",
            });
            _eventBus.Publish(new ConfirmTelegramBotEvent(userModel.AccountId, userModel.Code));
            return userModel;
        }

        public async Task<UserTelegram> AddFinishUser(long chatId, string message)
        {
            var user = _telegramBotRepository.GetUserTelegramByChatId(chatId);
            var userModel = user.ToArray()[0];
            if (userModel.Operation != "check_code" || userModel.Code != message || user == null)
            {
                await _telegramBotRepository.DeleteAsync(userModel.Id);
                return null;
            }

            userModel.Operation = "finish";
            userModel.IsRegistered = true;
            var newUserModel = new UserTelegram
            {
                ChatId = userModel.ChatId,
                AccountId = userModel.AccountId,
                IsLecture = userModel.IsLecture,
                IsRegistered = true,
                Code = userModel.Code,
                Operation = "finish",
            };
            await _telegramBotRepository.UpdateAsync(userModel.Id,x => new UserTelegram
            {
                ChatId = userModel.ChatId,
                AccountId = userModel.AccountId,
                IsLecture = userModel.IsLecture,
                IsRegistered = true,
                Code = userModel.Code,
                Operation = "finish",
            });
            return userModel;
        }

        public async Task<UserTelegram> UserByUpdate(Update update)
        {
            var user = update.Message == null
                ? await _telegramBotRepository.FindAsync(cm => cm.ChatId ==update.CallbackQuery.Message.Chat.Id)
                : await _telegramBotRepository.FindAsync(cm => cm.ChatId ==update.Message.Chat.Id);
            var newUserModel = new UserTelegram {
                ChatId = user.ChatId,
                AccountId = user.AccountId,
                IsLecture = user.IsLecture,
                IsRegistered = user.IsRegistered,
                Code = user.Code,
                Operation = "finish",
            };
            await _telegramBotRepository.UpdateAsync(user.Id, x => new UserTelegram
            {
                ChatId = user.ChatId,
                AccountId = user.AccountId,
                IsLecture = user.IsLecture,
                IsRegistered = user.IsRegistered,
                Code = user.Code,
                Operation = "finish",
            });
            return newUserModel;
        }
          
        public async Task<(bool, long)> CheckTelegramUserModelByStudentId(string studentId)
        {
            var user = await _telegramBotRepository.FindAsync(cm => cm.AccountId == studentId).ConfigureAwait(false);
            return (user != null, user?.ChatId ?? 0);
        }

        public async Task<long> ChatIdByStudentId(string studentId)
        {
            var user = await _telegramBotRepository.FindAsync(cm => cm.AccountId == studentId).ConfigureAwait(false);
            return user.ChatId;
        }

            public async Task<UserTelegram> AddTaskIdAndWaitPullRequest(Update update, long taskId)
        {
            var user = _telegramBotRepository.GetUserTelegramByChatId(update.CallbackQuery.Message.Chat.Id).ToArray()[0];
            var newUserModel = new UserTelegram
            {
                ChatId = user.ChatId,
                AccountId = user.AccountId,
                IsLecture = user.IsLecture,
                IsRegistered = user.IsRegistered,
                Code = user.Code,
                Operation = "wait_url",
                TaskIdToSend = taskId
            };
            await _telegramBotRepository.UpdateAsync(user.Id, x => newUserModel);
            return newUserModel;
        }

        public async Task<UserTelegram> AddGitHubUrlToTask(Update update, string url)
        {
            var user = _telegramBotRepository.GetUserTelegramByChatId(update.CallbackQuery.Message.Chat.Id).ToArray()[0];
            var newUserModel = new UserTelegram
            {
                ChatId = user.ChatId,
                AccountId = user.AccountId,
                IsLecture = user.IsLecture,
                IsRegistered = user.IsRegistered,
                Code = user.Code,
                Operation = "wait_comment",
                TaskIdToSend = user.TaskIdToSend,
                GitHubUrl = url
            };
            await _telegramBotRepository.UpdateAsync(user.Id, x => newUserModel);
            return newUserModel;
        }

        public async Task DeleteUser(Update update)
        {
            var user = update.Message == null
                ? await _telegramBotRepository.FindAsync(x => x.ChatId == update.CallbackQuery.Message.Chat.Id)
                : await _telegramBotRepository.FindAsync(x => x.ChatId == update.Message.Chat.Id);
            if (user == null)
            {
                return;
            }
            await _telegramBotRepository.DeleteAsync(user.Id);
        }
    }
}