using System.ComponentModel.DataAnnotations;

namespace TaskManagementAPI.Models
{
    public class AdminDetails
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; } // Foreign Key to User

        [StringLength(100)]
        public string Permissions { get; set; } = string.Empty; // JSON or comma-separated permissions
    }
}
