using System.Collections.Generic;
using System.Linq;
using FirstTestUserService.Models;
using Microsoft.AspNetCore.Mvc;

namespace FirstTestUserService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly UsersContext _db;

        public UsersController(UsersContext context)
        {
            _db = context;
            if (_db.Users.Any())
            {
                return;
            }
            _db.Users.Add(new User { Name = "Tom"});
            _db.Users.Add(new User { Name = "Alice"});
            _db.SaveChanges();
        }

        [HttpGet]
        public IEnumerable<User> Get()
        {
            return _db.Users.ToList();
        }

        // GET api/users/5
        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            var user = _db.Users.FirstOrDefault(x => x.Id == id);
            if (user == null)
            {
                return NotFound();
            }
            return new ObjectResult(user);
        }

        // POST api/users
        [HttpPost]
        public IActionResult Post([FromBody]User user)
        {
            if (user == null)
            {
                return BadRequest();
            }

            _db.Users.Add(user);
            _db.SaveChanges();
            return Ok(user);
        }

        // PUT api/users/
        [HttpPut]
        public IActionResult Put([FromBody]User user)
        {
            if (user == null)
            {
                return BadRequest();
            }
            if (!_db.Users.Any(x => x.Id == user.Id))
            {
                return NotFound();
            }

            _db.Update(user);
            _db.SaveChanges();
            return Ok(user);
        }

        // DELETE api/users/5
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var user = _db.Users.FirstOrDefault(x => x.Id == id);
            if (user == null)
            {
                return NotFound();
            }
            _db.Users.Remove(user);
            _db.SaveChanges();
            return Ok(user);
        }
    }
}
