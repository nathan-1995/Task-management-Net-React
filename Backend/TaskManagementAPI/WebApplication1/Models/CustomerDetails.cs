using System.ComponentModel.DataAnnotations;

namespace TaskManagementAPI.Models
{
    public class CustomerDetails
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; } // Foreign Key to User

        public SubscriptionPlan Plan { get; set; } = SubscriptionPlan.Free; // Default to Free

        [StringLength(500)]
        public string? Preferences { get; set; }

        [Required(ErrorMessage = "Address is required.")]
        [StringLength(200, ErrorMessage = "Address cannot exceed 200 characters.")]
        public string Address { get; set; } = "Default Address"; // Provide a default value

        [Required(ErrorMessage = "Country is required.")]
        [StringLength(100, ErrorMessage = "Country cannot exceed 100 characters.")]
        public string Country { get; set; } = "Default Country"; // Provide a default value

        [Required(ErrorMessage = "PhoneNumber is required.")]
        [StringLength(20, ErrorMessage = "PhoneNumber cannot exceed 20 characters.")]
        public string PhoneNumber { get; set; } = "000-000-0000"; // Provide a default value
    }

    public enum SubscriptionPlan
    {
        Free,
        Paid
    }
}
