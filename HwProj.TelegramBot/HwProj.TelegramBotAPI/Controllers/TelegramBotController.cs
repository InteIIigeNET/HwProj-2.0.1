using System;
using System.Threading.Tasks;
using HwProj.TelegramBotAPI.Service;
using Microsoft.AspNetCore.Mvc;
using Telegram.Bot.Types;


namespace HwProj.TelegramBotAPI.Controllers
{
    [ApiController]
    [Route("api/message/update")]
    public class TelegramBotController : Controller
    {
        private readonly ICommandService _commandService;

        public TelegramBotController(ICommandService commandService)
        {
            _commandService = commandService;
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
    }
}