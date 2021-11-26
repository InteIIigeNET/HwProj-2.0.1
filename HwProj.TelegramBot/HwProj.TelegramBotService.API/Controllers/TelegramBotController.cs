using System;
using System.Threading.Tasks;
using HwProj.TelegramBotService.API.Models;
using HwProj.TelegramBotService.API.Service;
using Microsoft.AspNetCore.Mvc;
using Telegram.Bot.Types;

namespace HwProj.TelegramBotService.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TelegramBotController : Controller
    {
        private readonly ICommandService _commandService;
        private readonly IUserService _userService;

        public TelegramBotController(ICommandService commandService, IUserService userService)
        {
            _commandService = commandService;
            _userService = userService;
        }
        
        [HttpPost]
        public async Task<IActionResult> Update(Update update)
        {
            
            if (update?.Message?.Chat == null && update?.CallbackQuery == null)
            {
                return Ok();
            }

            try
            {
                await _commandService.Execute(update);
            }
            catch (Exception e)
            {
                return Ok();
            }
            
            return Ok();
        }
        
        [HttpGet("get/{studentId}")]
        public async Task<TelegramUserModel> GetUser(string studentId)
        {
            return await _userService.GetTelegramUserModelByStudentId(studentId);
        }
    }
}