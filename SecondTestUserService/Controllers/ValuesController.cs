using System.Collections.Generic;
using System.Linq;
using FirstTestUserService.Events;
using HwProj.EventBus;
using Microsoft.AspNetCore.Mvc;

namespace SecondTestUserService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ValuesController : ControllerBase
    {
        CopyUsersContext db;
        IEventBus _eventBus;

        public ValuesController(CopyUsersContext context, IEventBus eventBus)
        {
            _eventBus = eventBus;
            db = context;
            if (!db.CopyUsers.Any())
            {
                db.CopyUsers.Add(new CopyUser { Name = "Tom" });
                db.CopyUsers.Add(new CopyUser { Name = "Alice" });
                db.SaveChanges();
            }
        }

        [HttpGet]
        public IEnumerable<CopyUser> Get()
        {
            return db.CopyUsers.ToList();
        }

        // GET api/users/5
        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            CopyUser user = db.CopyUsers.FirstOrDefault(x => x.Id == id);
            if (user == null)
                return NotFound();
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

            db.CopyUsers.Add(user);
            db.SaveChanges();

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
            if (!db.CopyUsers.Any(x => x.Id == user.Id))
            {
                return NotFound();
            }

            db.Update(user);
            db.SaveChanges();

            var @event = new UpdateEvent(user.Name, user.Id);
            _eventBus.Publish(@event);

            return Ok(user);
        }

        // DELETE api/users/5
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            CopyUser user = db.CopyUsers.FirstOrDefault(x => x.Id == id);
            if (user == null)
            {
                return NotFound();
            }
            db.CopyUsers.Remove(user);
            db.SaveChanges();

            var @event = new DeleteEvent(id);
            _eventBus.Publish(@event);

            return Ok(user);
        }
    }
}
