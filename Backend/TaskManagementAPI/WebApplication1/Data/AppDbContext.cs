using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using TaskManagementAPI.Models;
using TaskManagementAPI.Services;

namespace TaskManagementAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<CustomerDetails> CustomerDetails { get; set; }
        public DbSet<AdminDetails> AdminDetails { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Link CustomerDetails to Users via UserId
            modelBuilder.Entity<CustomerDetails>()
                .HasOne<User>()
                .WithOne()
                .HasForeignKey<CustomerDetails>(cd => cd.UserId);

            // Link AdminDetails to Users via UserId
            modelBuilder.Entity<AdminDetails>()
                .HasOne<User>()
                .WithOne()
                .HasForeignKey<AdminDetails>(ad => ad.UserId);

            // Seed admin user using Argon2 PasswordHasher
            var (adminHashedPassword, adminSalt) = PasswordHasher.HashPassword("admin123");
            modelBuilder.Entity<User>().HasData(new User
            {
                Id = 1,
                Name = "Admin User",
                Email = "admin@example.com",
                PasswordHash = adminHashedPassword,
                Salt = adminSalt,
                Role = User.UserRole.Admin,
                DateCreated = DateTime.UtcNow
            });

            // Seed customer user using Argon2 PasswordHasher
            var (customerHashedPassword, customerSalt) = PasswordHasher.HashPassword("customer123");
            modelBuilder.Entity<User>().HasData(new User
            {
                Id = 2,
                Name = "Customer User",
                Email = "customer@example.com",
                PasswordHash = customerHashedPassword,
                Salt = customerSalt,
                Role = User.UserRole.Customer,
                DateCreated = DateTime.UtcNow
            });

            modelBuilder.Entity<CustomerDetails>().HasData(new CustomerDetails
            {
                Id = 1,
                UserId = 2,
                Plan = SubscriptionPlan.Free,
                Preferences = "Default Preferences",
                Address = "123 Main Street",
                Country = "USA",
                PhoneNumber = "123-456-7890"
            });
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.ConfigureWarnings(warnings =>
                warnings.Ignore(RelationalEventId.PendingModelChangesWarning));
        }
    }
}