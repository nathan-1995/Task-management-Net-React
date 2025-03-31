using Konscious.Security.Cryptography;
using System.Security.Cryptography;
using System.Text;

namespace TaskManagementAPI.Services
{
    public class PasswordHasher
    {
        // Argon2id parameters as recommended for password hashing
        private const int MEMORY_SIZE = 65536;    // 64MB in KB
        private const int ITERATIONS = 3;         // Time cost
        private const int DEGREE_OF_PARALLELISM = 4;
        private const int SALT_SIZE = 16;         // 128 bits
        private const int HASH_SIZE = 32;         // 256 bits

        public static (string hash, string salt) HashPassword(string password)
        {
            // Generate a cryptographically secure random salt
            byte[] salt = new byte[SALT_SIZE];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }

            // Create Argon2id instance
            using var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
            {
                Salt = salt,
                DegreeOfParallelism = DEGREE_OF_PARALLELISM,
                Iterations = ITERATIONS,
                MemorySize = MEMORY_SIZE
            };

            // Generate the hash
            byte[] hash = argon2.GetBytes(HASH_SIZE);

            // Return Base64 encoded strings
            return (
                Convert.ToBase64String(hash),
                Convert.ToBase64String(salt)
            );
        }

        public static bool VerifyPassword(string password, string storedHash, string storedSalt)
        {
            try
            {
                // Convert the stored salt back to bytes
                byte[] saltBytes = Convert.FromBase64String(storedSalt);

                // Create Argon2id instance with same parameters
                using var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
                {
                    Salt = saltBytes,
                    DegreeOfParallelism = DEGREE_OF_PARALLELISM,
                    Iterations = ITERATIONS,
                    MemorySize = MEMORY_SIZE
                };

                // Generate hash with same parameters
                byte[] hashBytes = argon2.GetBytes(HASH_SIZE);
                string computedHash = Convert.ToBase64String(hashBytes);

                // Compare the computed hash with the stored hash
                return computedHash == storedHash;
            }
            catch
            {
                return false;
            }
        }
    }
}