using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TaskManagementAPI.Data;
using TaskManagementAPI.Models;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using TaskManagementAPI.Services;

namespace TaskManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public UserController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // GET: api/user
        [HttpGet]
        [Authorize(Roles = "Admin")] // Only admins can view all users
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // GET: api/user/{id}
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")] // Only admins can view all users
        public async Task<ActionResult<User>> GetUserById(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound(new { status = 404, message = $"User with ID {id} not found." });
            }



            return user;
        }

        // POST: api/user
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<User>> CreateUser(User user)
        {
            // Validate the incoming data
            if (!ModelState.IsValid)
            {
                HttpContext.Items["ValidationErrors"] = ModelState;
                return BadRequest(ModelState);
            }

            // Check for unique email
            if (_context.Users.Any(u => u.Email == user.Email))
            {
                return Conflict(new { message = "Email is already in use." });
            }

            // Use the PasswordHasher to generate the hash and salt
            var (hashedPassword, salt) = PasswordHasher.HashPassword(user.PasswordHash);

            // Set the hashed password and salt in the user object
            user.PasswordHash = hashedPassword;
            user.Salt = salt;

            // Add the user to the database
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
        }

        // DELETE: api/user/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // Only admins can delete users
        public async Task<IActionResult> DeleteUser(string id)
        {
            if (!int.TryParse(id, out var parsedId))
            {
                return BadRequest(new { message = "The provided ID must be an integer." });
            }

            var user = await _context.Users.FindAsync(parsedId);

            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/user/login
        [HttpPost("login")]
        [AllowAnonymous]
        public IActionResult Login([FromBody] LoginModel login)
        {
            // Find the user by email
            var user = _context.Users.FirstOrDefault(u => u.Email == login.Email);

            // Check if user exists and has required security credentials
            if (user == null || string.IsNullOrEmpty(user.PasswordHash) || string.IsNullOrEmpty(user.Salt))
            {
                // Use the same generic error message to prevent user enumeration
                return Unauthorized(new { message = "Invalid email or password." });
            }

            // Now we know user.PasswordHash and user.Salt are not null
            if (!PasswordHasher.VerifyPassword(login.Password, user.PasswordHash, user.Salt))
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            // JWT token generation - this part remains the same
            var jwtKey = _configuration["Jwt:Key"];
            if (string.IsNullOrEmpty(jwtKey))
            {
                return StatusCode(500, new { message = "JWT key is not configured." });
            }

            string userRole = user.Role.ToString();
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(jwtKey);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Name),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, userRole)
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audiences:Users"]
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            // Set the secure cookie
            Response.Cookies.Append("AuthToken", tokenString, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None, // Changed to None to support cross-site requests from SPA
                Expires = DateTime.UtcNow.AddHours(1)
            });

            // Return user information without the token (for security)
            return Ok(new
            {
                user = new
                {
                    id = user.Id,
                    email = user.Email,
                    role = userRole
                }
            });
        }

        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
        {
            // Remove the authentication cookie
            Response.Cookies.Delete("AuthToken", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None // Match the SameSite setting used during login
            });

            return Ok(new { message = "Logged out successfully" });
        }

        // PATCH: api/user/{id}
        [HttpPatch("{id}")]
        [Authorize(Roles = "Admin")] // Restrict this method to admins
        public async Task<IActionResult> PatchUser(int id, [FromBody] JsonPatchDocument<User> patchDoc)
        {
            if (patchDoc == null)
            {
                return BadRequest(new { message = "Patch document is null." });
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = $"User with ID {id} not found." });
            }

            // Apply the patch document to the user object
            patchDoc.ApplyTo(user, ModelState);

            // Validate the patched object
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Save changes to the database
            _context.Entry(user).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PATCH: api/user/self
        [HttpPatch("self")]
        [Authorize(Roles = "Customer")] // Ensure only customers can access this endpoint
        public async Task<IActionResult> UpdateCustomerProfile([FromBody] JsonPatchDocument<User> patchDoc)
        {
            if (patchDoc == null)
            {
                return BadRequest(new { message = "Patch document is null." });
            }

            // Get the current user's ID from the JWT claims
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "User ID is invalid or missing in the token." });
            }

            // Find the user in the database
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            // Ensure sensitive fields cannot be updated
            patchDoc.Operations.RemoveAll(op =>
                op.path.Equals("/passwordHash", StringComparison.OrdinalIgnoreCase) ||
                op.path.Equals("/salt", StringComparison.OrdinalIgnoreCase) ||
                op.path.Equals("/role", StringComparison.OrdinalIgnoreCase) ||
                op.path.Equals("/dateCreated", StringComparison.OrdinalIgnoreCase)
            );

            // Apply the patch document to the user object
            patchDoc.ApplyTo(user, ModelState);

            // Validate the patched object
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Save changes to the database
            _context.Entry(user).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/user/signup
        [HttpPost("signup")]
        [AllowAnonymous]
        public async Task<IActionResult> SignUp([FromBody] UserSignUpDto newUser)
        {
            // Validate the incoming data
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if the email already exists
            if (_context.Users.Any(u => u.Email == newUser.Email))
            {
                return Conflict(new { message = "Email is already registered." });
            }

            // Use PasswordHasher to securely hash the password
            var (hashedPassword, salt) = PasswordHasher.HashPassword(newUser.Password);

            // Create a new user with the secure password hash
            var user = new Models.User
            {
                Name = newUser.Name,
                Email = newUser.Email,
                PasswordHash = hashedPassword,
                Salt = salt,
                Role = Models.User.UserRole.Customer,
                DateCreated = DateTime.UtcNow
            };

            // Save the user to the database
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Create CustomerDetails as before
            var customerDetails = new CustomerDetails
            {
                UserId = user.Id,
                Plan = SubscriptionPlan.Free,
                Preferences = "Default Preferences"
            };

            _context.CustomerDetails.Add(customerDetails);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUserById), new { id = user.Id },
                new { message = "User successfully registered!" });
        }

        // GET: api/user/profile
        [HttpGet("profile")]
        [Authorize] // Requires authentication (JWT in cookies)
        public async Task<IActionResult> GetProfile()
        {
            // Get the user ID from the claims
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "User ID is invalid or missing in the token." });
            }

            // Find the user in the database
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            // Return user profile information
            return Ok(new
            {
                id = user.Id,
                name = user.Name,
                email = user.Email,
                role = user.Role.ToString(),
                dateCreated = user.DateCreated
            });
        }

        // GET: api/user/check-auth
        [HttpGet("check-auth")]
        public IActionResult CheckAuth()
        {
            // If the [Authorize] attribute is not enforced (user is not authenticated),
            // return unauthorized
            if (!User.Identity.IsAuthenticated)
            {
                return Unauthorized(new { authenticated = false });
            }

            // If we get here, the user is authenticated
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            return Ok(new
            {
                authenticated = true,
                role = role
            });
        }
    }
}