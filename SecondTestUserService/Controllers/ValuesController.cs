using System.Collections.Generic;
using System.Linq;
using HwProj.EventBus.Abstractions;
using Microsoft.AspNetCore.Mvc;
using SecondTestUserService.Events;
using SecondTestUserService.Models;

namespace SecondTestUserService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ValuesController : ControllerBase
    {
        private readonly CopyUsersContext _db;
        private readonly IEventBus _eventBus;

        public ValuesController(CopyUsersContext context, IEventBus eventBus)
        {
            _eventBus = eventBus;
            _db = context;
            if (_db.CopyUsers.Any())
            {
                return;
            }
            _db.CopyUsers.Add(new CopyUser { Name = "Tom" });
            _db.CopyUsers.Add(new CopyUser { Name = "Alice" });
            _db.SaveChanges();
        }

        [HttpGet]
        public IEnumerable<CopyUser> Get()
        {
            return _db.CopyUsers.ToList();
        }

        // GET api/users/5
        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            var user = _db.CopyUsers.FirstOrDefault(x => x.Id == id);
            if (user == null)
            {
                return NotFound();
            }
            return new ObjectResult(user);
        }

        // POST api/users
        [HttpPost]
        public IActionResult Post([FromBody]CopyUser user)
        {
            if (user == null)
            {
                return BadRequest();
            }

            _db.CopyUsers.Add(user);
            _db.SaveChanges();

            var @event = new AddEvent(user.Name);
            _eventBus.Publish(@event);

            return Ok(user);
        }

        // PUT api/users/
        [HttpPut]
        public IActionResult Put([FromBody]CopyUser user)
        {
            if (user == null)
            {
                return BadRequest();
            }
            if (!_db.CopyUsers.Any(x => x.Id == user.Id))
            {
                return NotFound();
            }

            _db.Update(user);
            _db.SaveChanges();

            var @event = new UpdateEvent(user.Name, user.Id);
            _eventBus.Publish(@event);

            return Ok(user);
        }

        // DELETE api/users/5
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var user = _db.CopyUsers.FirstOrDefault(x => x.Id == id);
            if (user == null)
            {
                return NotFound();
            }
            _db.CopyUsers.Remove(user);
            _db.SaveChanges();

            var @event = new DeleteEvent(id);
            _eventBus.Publish(@event);

            return Ok(user);
        }
    }
}
