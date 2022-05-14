using System;
using System.Threading.Tasks;
using HwProj.Models.TelegramBotService;
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
        public async Task<IActionResult> Update([FromBody] Update update)
        {
            
            if (update?.Message?.Chat == null && update?.CallbackQuery == null)
            {
                return Ok();
            }
            await _commandService.Execute(update);
            return Ok();
        }
        
        [HttpGet("check/{studentId}")]
        public async Task<IActionResult> CheckUserTelegram(string studentId)
        {
            var response =  await _userService.CheckTelegramUserModelByStudentId(studentId);
            return Ok(response);
        }
    }
}